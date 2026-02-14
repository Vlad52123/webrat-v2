import { type RefObject, type PointerEvent } from "react";

interface CaptchaState {
    kind: "loading" | "ready" | "unavailable";
    imageUrl?: string;
}

interface Props {
    state: CaptchaState;
    locked: boolean;
    verified: boolean;
    good: "good" | "bad" | null;
    sliderHint: string;
    captchaCircleSize: number;
    wrapRef: RefObject<HTMLDivElement | null>;
    sliderRef: RefObject<HTMLDivElement | null>;
    thumbRef: RefObject<HTMLDivElement | null>;
    trackRef: RefObject<HTMLDivElement | null>;
    imgRef: RefObject<HTMLImageElement | null>;
    targetRef: RefObject<HTMLDivElement | null>;
    moverRef: RefObject<HTMLDivElement | null>;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: () => void;
    onToggleCaptcha: () => void;
    onChangeImage: () => void;
}

export function CaptchaView({
    state,
    locked,
    sliderHint,
    captchaCircleSize,
    wrapRef,
    sliderRef,
    thumbRef,
    trackRef,
    imgRef,
    targetRef,
    moverRef,
    good,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onToggleCaptcha,
    onChangeImage,
}: Props) {
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
                        src={(state as { imageUrl: string }).imageUrl}
                        className="block h-full w-full select-none object-cover [filter:saturate(0.95)_contrast(0.98)]"
                        alt="captcha"
                        draggable={false}
                    />
                ) : null}

                <div
                    ref={targetRef}
                    className="pointer-events-none absolute rounded-full bg-black/35 shadow-[0_6px_14px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
                    style={{ width: captchaCircleSize, height: captchaCircleSize }}
                    aria-hidden="true"
                />

                <div
                    ref={moverRef}
                    className="pointer-events-none absolute rounded-full bg-transparent bg-no-repeat shadow-[0_6px_14px_rgba(0,0,0,0.22)] outline outline-1 outline-white/12 outline-offset-[-1px]"
                    style={{ width: captchaCircleSize, height: captchaCircleSize }}
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
                    "relative h-[42px] overflow-hidden rounded-full border bg-[rgba(24,14,42,0.52)]",
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
                    className="absolute inset-0 w-0 rounded-full bg-white/10"
                    aria-hidden="true"
                />

                <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-white/85 pointer-events-none select-none">
                    {sliderHint}
                </div>

                <div
                    ref={thumbRef}
                    className="absolute left-0 top-0 grid h-full w-[52px] cursor-grab place-items-center rounded-full border-r border-white/14 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_34px_rgba(0,0,0,0.26)] backdrop-blur-[10px] transition-[filter,transform] duration-150 hover:[filter:brightness(1.06)] active:cursor-grabbing active:scale-[0.98]"
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
                    className="mt-1 select-none cursor-pointer text-[12px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
                    onCopy={(e) => e.preventDefault()}
                >
                    change the captcha
                </button>
                <button
                    type="button"
                    onClick={onChangeImage}
                    className="mt-1 select-none cursor-pointer text-[12px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
                    onCopy={(e) => e.preventDefault()}
                >
                    change image
                </button>
            </div>
        </div>
    );
}