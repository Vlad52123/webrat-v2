import { type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SliderCaptcha, type SliderCaptchaHandle } from "../slider-captcha";
import type { UseFormReturn } from "react-hook-form";
import type { LoginValues } from "../../schemas";

interface Props {
    form: UseFormReturn<LoginValues>;
    forgotEmail: string;
    setForgotEmail: (v: string) => void;
    forgotLoading: boolean;
    captchaReady: boolean;
    useTurnstile: boolean;
    setUseTurnstile: (v: boolean) => void;
    setCaptchaReady: (v: boolean) => void;
    captchaRef: RefObject<SliderCaptchaHandle | null>;
    turnstileContainerRef: RefObject<HTMLDivElement | null>;
    handleCaptchaReadyChange: (ready: boolean) => void;
    handleCaptchaError: (msg: string) => void;
    handleToggleCaptcha: () => void;
    handleForgotSendCode: () => void;
    backToLogin: () => void;
    inputClassName: string;
}

export function ForgotEmailMode({
    form,
    forgotEmail,
    setForgotEmail,
    forgotLoading,
    captchaReady,
    useTurnstile,
    setUseTurnstile,
    setCaptchaReady,
    captchaRef,
    turnstileContainerRef,
    handleCaptchaReadyChange,
    handleCaptchaError,
    handleToggleCaptcha,
    handleForgotSendCode,
    backToLogin,
    inputClassName,
}: Props) {
    return (
        <div className="relative w-full grid justify-items-center">
            <div className="grid w-full gap-[10px] justify-items-center">
                <div className="grid w-full max-w-[380px] grid-cols-2 gap-2.5 max-[520px]:grid-cols-1">
                    <Input
                        id="login"
                        type="text"
                        autoComplete="username"
                        placeholder="login"
                        required
                        className={inputClassName}
                        {...form.register("login")}
                    />
                    <Input
                        id="forgotEmail"
                        type="email"
                        autoComplete="email"
                        placeholder="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className={inputClassName}
                    />
                </div>

                {useTurnstile ? (
                    <div className="grid w-full max-w-[380px] gap-2 rounded-2xl border border-[rgba(117,61,255,0.32)] bg-[rgba(24,14,42,0.52)] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-[14px]">
                        <div className="flex items-center justify-center rounded-xl border border-[rgba(117,61,255,0.32)] bg-white/6 p-3">
                            <div ref={turnstileContainerRef} />
                        </div>
                        <button
                            type="button"
                            className="select-none justify-self-center cursor-pointer text-[13px] font-normal text-[rgba(227,190,255,0.80)] hover:text-white"
                            onClick={() => {
                                setUseTurnstile(false);
                                setCaptchaReady(false);
                            }}
                        >
                            change the captcha
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-[380px]">
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

                <Button
                    type="button"
                    disabled={forgotLoading || !captchaReady || !forgotEmail.trim() || !String(form.getValues("login") || "").trim()}
                    onClick={handleForgotSendCode}
                    className="mt-[10px] h-10 w-full max-w-[340px] rounded-full border border-[rgba(214,154,255,0.42)] bg-[rgba(117,61,255,0.82)] text-[18px] font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_42px_rgba(186,85,211,0.22)] transition-[transform,box-shadow,filter,opacity] duration-150 enabled:cursor-pointer hover:bg-[rgba(117,61,255,0.88)] enabled:hover:-translate-y-px enabled:hover:shadow-[0_22px_52px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_22px_56px_rgba(117,61,255,0.24)] enabled:hover:[filter:brightness(1.06)] enabled:active:translate-y-0 enabled:active:[filter:brightness(0.94)] disabled:opacity-60 disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)]"
                >
                    {forgotLoading ? "Sending..." : "Send code"}
                </Button>

                <button
                    type="button"
                    className="mt-[4px] cursor-pointer select-none text-[14px] font-normal text-[rgba(227,190,255,0.80)] transition-colors duration-150 hover:text-white"
                    onClick={backToLogin}
                >
                    back to login
                </button>
            </div>
        </div>
    );
}