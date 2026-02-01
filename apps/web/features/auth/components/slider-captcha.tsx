"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

export type SliderCaptchaHandle = {
  reset: () => void;
  refresh: () => void;
};

type CaptchaState =
  | { kind: "loading" }
  | { kind: "ready"; imageUrl: string }
  | { kind: "unavailable" };

const CAPTCHA_CIRCLE_SIZE = 140;

function getCookie(name: string): string {
  const parts = String(document.cookie || "").split(";");
  for (const p of parts) {
    const kv = p.trim();
    if (!kv) continue;
    const eq = kv.indexOf("=");
    const k = eq >= 0 ? kv.slice(0, eq) : kv;
    if (k === name) return eq >= 0 ? decodeURIComponent(kv.slice(eq + 1)) : "";
  }
  return "";
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

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

  const readyUntilRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);
  const unlockAtRef = useRef<number>(0);
  const unlockTimerRef = useRef<number | null>(null);
  const initSeqRef = useRef(0);

  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const thumbStartLeftRef = useRef(0);

  const sliderHint = useMemo(() => {
    if (verified && good === "good") return "VERIFIED";
    if (verified) return "VERIFYING";
    if (locked) return "Loading captcha...";
    return "Slide to Verify →";
  }, [verified, good, locked]);

  const reset = useCallback(() => {
    setVerified(false);
    setGood(null);
    readyUntilRef.current = 0;
    onReadyChange(false);

    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (thumb) {
      thumb.style.left = "0px";
      thumb.setAttribute("aria-valuenow", "0");
    }
    if (track) track.style.width = "0px";

    const mover = moverRef.current;
    if (mover) {
      mover.style.transform = `translateY(-50%) rotate(${startAngleRef.current}deg)`;
    }
  }, [onReadyChange]);

  const listImages = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch(`/api/captcha-images`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return [];
      const data = (await res.json()) as unknown;
      return Array.isArray(data) ? data.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }, []);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const imgs = await listImages();
    if (!imgs.length) return null;
    const idx = Math.floor(Math.random() * imgs.length);
    return imgs[idx] ?? null;
  }, [listImages]);

  const placeTargets = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    const target = targetRef.current;
    const mover = moverRef.current;
    if (!wrap || !img || !target || !mover) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;

    const targetX = width / 2 - CAPTCHA_CIRCLE_SIZE / 2;
    const targetY = height / 2 - CAPTCHA_CIRCLE_SIZE / 2;

    target.style.top = "50%";
    target.style.left = `${targetX}px`;
    target.style.transform = "translateY(-50%)";

    const src = img.currentSrc || img.src;
    mover.style.backgroundImage = src ? `url("${src}")` : "";

    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const renderW = img.naturalWidth * scale;
    const renderH = img.naturalHeight * scale;

    const offsetX = (renderW - width) / 2;
    const offsetY = (renderH - height) / 2;

    mover.style.backgroundSize = `${renderW}px ${renderH}px`;
    mover.style.backgroundPosition = `-${targetX + offsetX}px -${targetY + offsetY}px`;

    mover.style.top = "50%";
    mover.style.left = `${targetX}px`;
    mover.style.transform = `translateY(-50%) rotate(${currentAngleRef.current}deg)`;
  }, []);

  const updateMoverFromThumb = useCallback(() => {
    const slider = sliderRef.current;
    const thumb = thumbRef.current;
    const mover = moverRef.current;
    if (!slider || !thumb || !mover) return;

    const sliderRect = slider.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const maxLeft = sliderRect.width - thumbRect.width;
    const left = parseFloat(thumb.style.left || "0");
    const t = maxLeft > 0 ? left / maxLeft : 0;

    const angle = startAngleRef.current + t * 360;
    currentAngleRef.current = angle;

    mover.style.transform = `translateY(-50%) rotate(${angle}deg)`;
  }, []);

  const initCaptcha = useCallback(async (minLoadingMs = 0) => {
    const seq = ++initSeqRef.current;
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    unlockAtRef.current = Date.now() + Math.max(0, minLoadingMs);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (verified || locked) return;
    const thumb = thumbRef.current;
    if (!thumb) return;

    draggingRef.current = true;
    thumb.setPointerCapture(e.pointerId);

    dragStartXRef.current = e.clientX;
    thumbStartLeftRef.current = parseFloat(thumb.style.left || "0");
  }, [verified, locked]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || verified || locked) return;

    const slider = sliderRef.current;
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!slider || !thumb || !track) return;

    const sliderRect = slider.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const maxLeft = sliderRect.width - thumbRect.width;

    const dx = e.clientX - dragStartXRef.current;
    const left = clamp(thumbStartLeftRef.current + dx, 0, maxLeft);

    thumb.style.left = `${left}px`;
    track.style.width = `${left + thumbRect.width}px`;

    const percent = maxLeft > 0 ? Math.round((left / maxLeft) * 100) : 0;
    thumb.setAttribute("aria-valuenow", String(percent));

    updateMoverFromThumb();
  }, [verified, locked, updateMoverFromThumb]);

  const verifyServerSide = useCallback(async (): Promise<{ ok: boolean; status: number }> => {
    try {
      const csrf = getCookie("webrat_csrf");
      const res = await fetch(`/api/captcha-verify`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        },
      });
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 0 };
    }
  }, []);

  const onPointerUp = useCallback(async () => {
    if (!draggingRef.current || verified || locked) return;

    draggingRef.current = false;

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
      const res = await verifyServerSide();
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
  }, [initCaptcha, locked, onError, onReadyChange, verifyServerSide, verified]);

  useEffect(() => {
    if (!readyUntilRef.current) return;
    const t = window.setInterval(() => {
      if (readyUntilRef.current && Date.now() > readyUntilRef.current) {
        readyUntilRef.current = 0;
        onReadyChange(false);
        void initCaptcha();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [initCaptcha, onReadyChange]);

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

        <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-white/85 pointer-events-none">
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
        >
          <span className="text-white/86 [text-shadow:0_10px_24px_rgba(0,0,0,0.32)]">→</span>
        </div>
      </div>

      <div className="min-h-[14px]" aria-live="polite" />

      <div className="flex items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={onToggleCaptcha}
          className="mt-1 cursor-pointer text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
        >
          change the captcha
        </button>
        <button
          type="button"
          onClick={() => {
            if (locked) return;
            void initCaptcha(1000);
          }}
          className="mt-1 cursor-pointer text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
        >
          change image
        </button>
      </div>
    </div>
  );
});
