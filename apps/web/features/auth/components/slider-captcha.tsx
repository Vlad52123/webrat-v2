"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { resetUi } from "./slider-captcha/reset-ui";
import { useCaptchaImages } from "./slider-captcha/use-captcha-images";
import { useCaptchaLayout } from "./slider-captcha/use-captcha-layout";
import { useReadyExpiry } from "./slider-captcha/use-ready-expiry";
import { useSliderDrag } from "./slider-captcha/use-slider-drag";
import { verifyCaptchaServerSide } from "./slider-captcha/verify";
import { CaptchaView } from "./slider-captcha/captcha-view";

export type SliderCaptchaHandle = {
    reset: () => void;
    refresh: () => void;
};

type CaptchaState =
    | { kind: "loading" }
    | { kind: "ready"; imageUrl: string }
    | { kind: "unavailable" };

const CAPTCHA_CIRCLE_SIZE = 170;

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

    const { onPointerDown, onPointerMove, endDrag } = useSliderDrag({
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

    const onChangeImage = useCallback(() => {
        const now = Date.now();
        if (lockedRef.current) return;
        if (now < changeImageCooldownUntilRef.current) return;
        changeImageCooldownUntilRef.current = now + 900;
        void initCaptcha(1000);
    }, [initCaptcha]);

    return (
        <CaptchaView
            state={state}
            locked={locked}
            verified={verified}
            good={good}
            sliderHint={sliderHint}
            captchaCircleSize={CAPTCHA_CIRCLE_SIZE}
            wrapRef={wrapRef}
            sliderRef={sliderRef}
            thumbRef={thumbRef}
            trackRef={trackRef}
            imgRef={imgRef}
            targetRef={targetRef}
            moverRef={moverRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onToggleCaptcha={onToggleCaptcha}
            onChangeImage={onChangeImage}
        />
    );
});
