"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { resetUi } from "./slider-captcha/reset-ui";
import { useCaptchaImages } from "./slider-captcha/use-captcha-images";
import { useCaptchaLayout } from "./slider-captcha/use-captcha-layout";
import { useReadyExpiry } from "./slider-captcha/use-ready-expiry";
import { useSliderDrag } from "./slider-captcha/use-slider-drag";
import { verifyCaptchaServerSide } from "./slider-captcha/verify";

export type SliderCaptchaHandle = {
   reset: () => void;
   refresh: () => void;
};

type CaptchaState =
   | { kind: "loading" }
   | { kind: "ready"; imageUrl: string }
   | { kind: "unavailable" };

const CAPTCHA_CIRCLE_SIZE = 140;

export const SliderCaptcha = forwardRef<
   SliderCaptchaHandle,
   {
      onReadyChange: (ready: boolean) => void;
      onError: (message: string) => void;
      onToggleCaptcha: () => void;
   }
>(function SliderCaptcha({ onReadyChange, onError, onToggleCaptcha }, ref) {
   const wrapRef = useRef<HTMLDivElement | null>(null);
   const sliderRef = useRef<HTMLDivElement | null>(null);
   const thumbRef = useRef<HTMLDivElement | null>(null);
   const trackRef = useRef<HTMLDivElement | null>(null);
   const imgRef = useRef<HTMLImageElement | null>(null);
   const targetRef = useRef<HTMLDivElement | null>(null);
   const moverRef = useRef<HTMLDivElement | null>(null);

   const [state, setState] = useState<CaptchaState>({ kind: "loading" });
   const [locked, setLocked] = useState(true);
   const [verified, setVerified] = useState(false);
   const [good, setGood] = useState<"good" | "bad" | null>(null);

   const lockedRef = useRef(true);
   const changeImageCooldownUntilRef = useRef(0);

   const readyUntilRef = useRef<number>(0);
   const startAngleRef = useRef<number>(0);
   const currentAngleRef = useRef<number>(0);
   const unlockAtRef = useRef<number>(0);
   const unlockTimerRef = useRef<number | null>(null);
   const initSeqRef = useRef(0);

   const { pickImage } = useCaptchaImages();

   const { placeTargets, updateMoverFromThumb } = useCaptchaLayout({
      refs: {
         wrapRef,
         sliderRef,
         thumbRef,
         trackRef,
         imgRef,
         targetRef,
         moverRef,
      },
      captchaCircleSize: CAPTCHA_CIRCLE_SIZE,
      startAngleRef,
      currentAngleRef,
   });

   const sliderHint = useMemo(() => {
      if (verified && good === "good") return "VERIFIED";
      if (verified) return "VERIFYING";
      if (locked) return "Loading captcha...";
      return "Slide to Verify";
   }, [verified, good, locked]);

   const reset = useCallback(() => {
      setVerified(false);
      setGood(null);
      readyUntilRef.current = 0;
      onReadyChange(false);
      resetUi({ thumbRef, trackRef, moverRef, startAngleRef });
   }, [onReadyChange]);

   const initCaptcha = useCallback(async (minLoadingMs = 0) => {
      const seq = ++initSeqRef.current;
      if (unlockTimerRef.current) {
         window.clearTimeout(unlockTimerRef.current);
         unlockTimerRef.current = null;
      }
      unlockAtRef.current = Date.now() + Math.max(0, minLoadingMs);

      lockedRef.current = true;
      setLocked(true);
      setState({ kind: "loading" });

      const imgUrl = await pickImage();
      if (seq !== initSeqRef.current) return;
      if (!imgUrl) {
         setState({ kind: "unavailable" });
         setLocked(true);
         onError("Captcha images not found");
         return;
      }

      let angle = Math.floor(Math.random() * 360);
      let aNorm = ((angle % 360) + 360) % 360;
      while (Math.min(aNorm, 360 - aNorm) <= 15) {
         angle = Math.floor(Math.random() * 360);
         aNorm = ((angle % 360) + 360) % 360;
      }

      startAngleRef.current = angle;
      currentAngleRef.current = angle;

      reset();
      if (seq !== initSeqRef.current) return;
      setState({ kind: "ready", imageUrl: imgUrl });
   }, [onError, pickImage, reset]);

   useImperativeHandle(
      ref,
      () => ({
         reset,
         refresh: () => void initCaptcha(),
      }),
      [initCaptcha, reset],
   );

   useEffect(() => {
      const t = window.setTimeout(() => void initCaptcha(), 0);
      return () => window.clearTimeout(t);
   }, [initCaptcha]);

   useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const onLoad = () => {
         const wait = Math.max(0, unlockAtRef.current - Date.now());
         unlockTimerRef.current = window.setTimeout(() => {
            unlockTimerRef.current = null;
            lockedRef.current = false;
            setLocked(false);
            requestAnimationFrame(() => {
               placeTargets();
               updateMoverFromThumb();
            });
         }, wait);
      };

      img.addEventListener("load", onLoad);
      if (img.complete && img.naturalWidth > 0) {
         onLoad();
      }
      return () => {
         img.removeEventListener("load", onLoad);
         if (unlockTimerRef.current) {
            window.clearTimeout(unlockTimerRef.current);
            unlockTimerRef.current = null;
         }
      };
   }, [placeTargets, updateMoverFromThumb, state]);

   useEffect(() => {
      const onResize = () => {
         placeTargets();
         updateMoverFromThumb();
      };

      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
   }, [placeTargets, updateMoverFromThumb]);

   const { draggingRef, onPointerDown, onPointerMove, endDrag } = useSliderDrag({
      locked,
      verified,
      thumbRef,
      sliderRef,
      trackRef,
      updateMoverFromThumb,
   });

   const onPointerUp = useCallback(async () => {
      const ended = endDrag();
      if (!ended) return;

      const thumb = thumbRef.current;
      const track = trackRef.current;
      if (!thumb || !track) return;

      const thumbLeft = parseFloat(thumb.style.left || "0");
      if (thumbLeft <= 1) {
         setGood(null);
         return;
      }

      let a = currentAngleRef.current % 360;
      if (a < 0) a += 360;
      const diff = Math.min(a, 360 - a);

      if (diff <= 6) {
         setVerified(true);
         setGood(null);
         const res = await verifyCaptchaServerSide();
         if (!res.ok) {
            if (res.status === 401) {
               onError("Captcha expired");
               await initCaptcha();
               return;
            }
            onError("Captcha verification failed");
            await initCaptcha();
            return;
         }

         setGood("good");
         readyUntilRef.current = Date.now() + 2 * 60 * 1000;
         onReadyChange(true);

         const thumbRect = thumb.getBoundingClientRect();
         thumb.style.left = "0px";
         thumb.setAttribute("aria-valuenow", "0");
         track.style.width = `${thumbRect.width}px`;
         return;
      }

      setGood("bad");

      thumb.style.left = "0px";
      thumb.setAttribute("aria-valuenow", "0");
      track.style.width = "0px";

      currentAngleRef.current = startAngleRef.current;
      const mover = moverRef.current;
      if (mover) {
         mover.style.transform = `translateY(-50%) rotate(${startAngleRef.current}deg)`;
      }
   }, [endDrag, initCaptcha, locked, onError, onReadyChange, verified]);

   useReadyExpiry({
      readyUntilRef,
      onReadyChange,
      initCaptcha,
   });

   return (
      <div className="grid gap-[10px]" id="sliderCaptchaBlock">
         <div
            ref={wrapRef}
            className={[
               "relative w-full overflow-hidden rounded-[14px] border border-[rgba(117,61,255,0.32)] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_44px_rgba(0,0,0,0.28)]",
               "aspect-[16/9]",
               locked || state.kind !== "ready" ? "bg-white" : "bg-white/6",
            ].join(" ")}
            aria-label="captcha"
         >
            {state.kind === "ready" ? (
               <img
                  ref={imgRef}
                  src={state.imageUrl}
                  className="block h-full w-full select-none object-cover [filter:saturate(0.95)_contrast(0.98)]"
                  alt="captcha"
                  draggable={false}
               />
            ) : null}

            <div
               ref={targetRef}
               className="pointer-events-none absolute size-[140px] rounded-full bg-black/35 shadow-[0_6px_14px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
               aria-hidden="true"
            />

            <div
               ref={moverRef}
               className="pointer-events-none absolute size-[140px] rounded-full bg-transparent bg-no-repeat shadow-[0_6px_14px_rgba(0,0,0,0.22)] outline outline-1 outline-white/12 outline-offset-[-1px]"
               aria-hidden="true"
            />

            {locked ? (
               <div className="absolute inset-0 grid place-items-center bg-white text-base font-medium text-black/55">
                  Loading captcha...
               </div>
            ) : null}
         </div>

         <div
            ref={sliderRef}
            className={[
               "relative h-[42px] overflow-hidden rounded-full border bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.18)_100%)]",
               good === null
                  ? "border-[rgba(117,61,255,0.32)] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.30)]"
                  : "",
               good === "bad" ? "border-[rgba(255,70,70,0.95)] shadow-[0_0_32px_rgba(255,70,70,0.55)]" : "",
               good === "good" ? "border-[rgba(80,255,160,0.98)] shadow-[0_0_32px_rgba(80,255,160,0.55)]" : "",
            ].join(" ")}
            role="group"
            aria-label="Slide to verify"
         >
            <div
               ref={trackRef}
               className="absolute inset-0 w-0 rounded-full bg-[linear-gradient(90deg,rgba(186,85,211,0.18)_0%,rgba(117,61,255,0.14)_60%,rgba(255,120,210,0.12)_100%)] opacity-55 blur-[6px]"
               aria-hidden="true"
            />

            <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-white/85 pointer-events-none select-none">
               {sliderHint}
            </div>

            <div
               ref={thumbRef}
               className="absolute left-0 top-0 grid h-full w-[52px] cursor-grab place-items-center rounded-full border-r border-white/14 bg-[radial-gradient(120px_60px_at_30%_30%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_55%),linear-gradient(135deg,rgba(186,85,211,0.35)_0%,rgba(117,61,255,0.30)_55%,rgba(255,120,210,0.22)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_34px_rgba(0,0,0,0.26)] backdrop-blur-[10px] transition-[filter,transform] duration-150 hover:[filter:brightness(1.06)_saturate(1.06)] active:cursor-grabbing active:scale-[0.98]"
               tabIndex={0}
               role="slider"
               aria-valuemin={0}
               aria-valuemax={100}
               aria-valuenow={0}
               onPointerDown={onPointerDown}
               onPointerMove={onPointerMove}
               onPointerUp={() => void onPointerUp()}
               onMouseDown={(e) => {
                  try {
                     e.preventDefault();
                  } catch {
                  }
               }}
            >
               <span className="text-white/86 select-none [user-select:none] [text-shadow:0_10px_24px_rgba(0,0,0,0.32)]">→</span>
            </div>
         </div>

         <div className="min-h-[14px]" aria-live="polite" />

         <div className="flex items-center justify-center gap-3.5">
            <button
               type="button"
               onClick={onToggleCaptcha}
               className="mt-1 select-none cursor-pointer text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
               onCopy={(e) => e.preventDefault()}
            >
               change the captcha
            </button>
            <button
               type="button"
               onClick={() => {
                  const now = Date.now();
                  if (lockedRef.current) return;
                  if (now < changeImageCooldownUntilRef.current) return;
                  changeImageCooldownUntilRef.current = now + 900;
                  void initCaptcha(1000);
               }}
               className="mt-1 select-none cursor-pointer text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
               onCopy={(e) => e.preventDefault()}
            >
               change image
            </button>
         </div>
      </div>
   );
});