"use client";

import { SliderCaptcha, type SliderCaptchaHandle } from "@/features/auth/components/slider-captcha";
import { useTurnstile as useTurnstileHook } from "@/features/auth/components/login-form/use-turnstile";
import { useCallback, useRef, useState } from "react";

const inputCls =
    "h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]";
const btnCls =
    "min-w-[130px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]";

function formatTime(ms: number): string {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function EmailInputView({
    email,
    setEmail,
    passwordOrCode,
    setPasswordOrCode,
    step,
    expiresAt,
    remaining,
    timerExpired,
    onConfirm,
}: {
    email: string;
    setEmail: (v: string) => void;
    passwordOrCode: string;
    setPasswordOrCode: (v: string) => void;
    step: "input" | "code";
    expiresAt: number;
    remaining: number;
    timerExpired: boolean;
    onConfirm: () => void;
}) {
    const captchaRef = useRef<SliderCaptchaHandle | null>(null);
    const [captchaReady, setCaptchaReady] = useState(false);
    const [useTurnstile, setUseTurnstile] = useState(false);

    const { turnstileContainerRef } = useTurnstileHook({
        useTurnstile,
        setCaptchaReady,
    });

    const handleCaptchaReadyChange = useCallback((ready: boolean) => {
        setCaptchaReady(ready);
    }, []);

    const handleCaptchaError = useCallback(() => { }, []);

    const handleToggleCaptcha = useCallback(() => {
        setUseTurnstile(true);
        setCaptchaReady(false);
    }, []);

    const sendCodeDisabled = step === "input" && !captchaReady;

    return (
        <div className="grid gap-[12px] p-[18px]">
            <input
                id="emailNewInput"
                className={inputCls}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step === "code"}
            />

            {step === "code" ? (
                <>
                    <input
                        id="emailCodeInput"
                        className={inputCls + " font-mono tracking-[4px]"}
                        type="text"
                        placeholder="Enter code"
                        value={passwordOrCode}
                        onChange={(e) => setPasswordOrCode(e.target.value)}
                        maxLength={8}
                        autoComplete="off"
                    />
                    {expiresAt > 0 && (
                        <div className={"text-center text-[13px] font-semibold " + (timerExpired ? "text-[#ff5555]" : "text-white/[0.5]")}>
                            {timerExpired ? "Code expired" : formatTime(remaining)}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <input
                        id="emailPasswordInput"
                        className={inputCls}
                        type="password"
                        placeholder="Account password"
                        value={passwordOrCode}
                        onChange={(e) => setPasswordOrCode(e.target.value)}
                    />

                    {useTurnstile ? (
                        <div className="grid w-full gap-2 rounded-2xl border border-[rgba(117,61,255,0.32)] bg-[rgba(24,14,42,0.52)] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-[14px]">
                            <div className="flex items-center justify-center rounded-xl border border-[rgba(117,61,255,0.32)] bg-white/6 p-3">
                                <div ref={turnstileContainerRef} />
                            </div>
                            <button
                                type="button"
                                className="cursor-pointer select-none justify-self-center text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
                                onClick={() => {
                                    setUseTurnstile(false);
                                    setCaptchaReady(false);
                                }}
                            >
                                change the captcha
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="grid gap-2 rounded-2xl border border-[rgba(117,61,255,0.32)] bg-[rgba(24,14,42,0.52)] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-[14px]">
                                <SliderCaptcha
                                    ref={captchaRef}
                                    onReadyChange={handleCaptchaReadyChange}
                                    onError={handleCaptchaError}
                                    onToggleCaptcha={handleToggleCaptcha}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="mt-[4px] flex justify-center">
                <button
                    id="emailModalConfirm"
                    className={btnCls + ((timerExpired || sendCodeDisabled) ? " pointer-events-none opacity-50" : "")}
                    style={{ borderBottomColor: "var(--line)" }}
                    type="button"
                    onClick={onConfirm}
                    disabled={timerExpired || sendCodeDisabled}
                >
                    {step === "code" ? "Verify" : "Send code"}
                </button>
            </div>
        </div>
    );
}
