"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginSchema, type LoginValues } from "../schemas";
import { showToast } from "@/features/panel/toast";
import { SliderCaptcha, type SliderCaptchaHandle } from "./slider-captcha";
import { useInputsErrorReset } from "./login-form/use-inputs-error-reset";
import { useSubmitCooldown } from "./login-form/use-submit-cooldown";
import { useTurnstile as useTurnstileHook } from "./login-form/use-turnstile";
import { useLoginMutation } from "./login-form/use-login-mutation";
import { useForgotPassword } from "./login-form/use-forgot-password";
import { ForgotEmailMode } from "./login-form/forgot-email-mode";
import { ForgotCodeMode } from "./login-form/forgot-code-mode";

export function LoginForm() {
   const captchaRef = useRef<SliderCaptchaHandle | null>(null);
   const [useTurnstile, setUseTurnstile] = useState(false);
   const [captchaReady, setCaptchaReady] = useState(false);
   const [inputsError, setInputsError] = useState(false);

   const {
      cooldownTick,
      submitCooldownUntilRef,
      clearSubmitCooldown,
      ensureSubmitCooldownTimer,
      startCooldownForSeconds,
      isCooldownActive,
      showCooldownNoticeNow,
   } = useSubmitCooldown({
      showToast,
      setInputsError,
   });

   const handleCaptchaReadyChange = useCallback((ready: boolean) => {
      setCaptchaReady(ready);
   }, []);

   const handleCaptchaError = useCallback((msg: string) => {
      showToast("error", msg);
   }, []);

   const handleToggleCaptcha = useCallback(() => {
      setUseTurnstile(true);
      setCaptchaReady(false);
   }, []);

   const form = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { login: "", password: "" },
   });

   const { turnstileContainerRef, turnstileToken, setTurnstileToken } = useTurnstileHook({
      useTurnstile,
      setCaptchaReady,
   });

   const loginValue = form.watch("login");
   const passwordValue = form.watch("password");
   const credsOk =
      /^[A-Za-z0-9_-]{5,12}$/.test(String(loginValue || "")) &&
      /^[A-Za-z0-9_-]{6,24}$/.test(String(passwordValue || ""));

   useInputsErrorReset({
      inputsError,
      setInputsError,
      loginValue,
      passwordValue,
   });

   const mutation = useLoginMutation({
      captchaRef,
      setCaptchaReady,
      setInputsError,
      clearSubmitCooldown,
      startCooldownForSeconds,
      setTurnstileToken,
      useTurnstile,
      turnstileToken,
   });

   const submitEnabled = useMemo(() => {
      if (isCooldownActive()) return false;
      return credsOk && captchaReady && !mutation.isPending;
   }, [captchaReady, credsOk, mutation.isPending, cooldownTick]);

   const inputClassName = [
      "h-[38px] rounded-xl border border-[rgba(214,154,255,0.32)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.12)_100%)] px-[10px] py-0 text-center text-[16px] leading-[38px] md:text-[16px] md:leading-[38px] text-white placeholder:text-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_14px_30px_rgba(0,0,0,0.22)] backdrop-blur-[10px] transition-[border-color,box-shadow,background,transform] duration-150 focus-visible:outline-none focus-visible:border-[rgba(235,200,255,0.62)] focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_0_0_3px_rgba(186,85,211,0.22),0_18px_40px_rgba(117,61,255,0.14)]",
      inputsError
         ? "border-[rgba(255,70,70,1)] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_0_3px_rgba(255,70,70,0.18),0_0_18px_rgba(255,70,70,0.18)]"
         : "",
   ].join(" ");

   const forgot = useForgotPassword(form);

   const backToLoginWithCaptchaReset = useCallback(() => {
      forgot.backToLogin();
      setCaptchaReady(false);
      setUseTurnstile(false);
   }, [forgot.backToLogin]);

   if (forgot.forgotMode === "email") {
      return (
         <ForgotEmailMode
            form={form}
            forgotEmail={forgot.forgotEmail}
            setForgotEmail={forgot.setForgotEmail}
            forgotLoading={forgot.forgotLoading}
            captchaReady={captchaReady}
            useTurnstile={useTurnstile}
            setUseTurnstile={setUseTurnstile}
            setCaptchaReady={setCaptchaReady}
            captchaRef={captchaRef}
            turnstileContainerRef={turnstileContainerRef}
            handleCaptchaReadyChange={handleCaptchaReadyChange}
            handleCaptchaError={handleCaptchaError}
            handleToggleCaptcha={handleToggleCaptcha}
            handleForgotSendCode={forgot.handleForgotSendCode}
            backToLogin={backToLoginWithCaptchaReset}
            inputClassName={inputClassName}
         />
      );
   }

   if (forgot.forgotMode === "code") {
      return (
         <ForgotCodeMode
            forgotCode={forgot.forgotCode}
            setForgotCode={forgot.setForgotCode}
            forgotNewPassword={forgot.forgotNewPassword}
            setForgotNewPassword={forgot.setForgotNewPassword}
            forgotLoading={forgot.forgotLoading}
            handleForgotReset={forgot.handleForgotReset}
            backToLogin={backToLoginWithCaptchaReset}
            inputClassName={inputClassName}
         />
      );
   }

   return (
      <div className="relative w-full grid justify-items-center">
         <form
            className="grid w-full gap-[10px] justify-items-center"
            autoComplete="on"
            onSubmit={form.handleSubmit((values) => {
               if (isCooldownActive()) {
                  showCooldownNoticeNow();
                  return;
               }
               if (!captchaReady) {
                  showToast("warning", "Complete the captcha first");
                  setInputsError(true);
                  return;
               }
               if (!credsOk) {
                  showToast("error", "Invalid login or password");
                  setInputsError(true);
                  return;
               }
               mutation.mutate(values);
            })}
         >
            <div className="grid w-full max-w-[380px] grid-cols-2 gap-2.5 max-[520px]:grid-cols-1">
               <Input
                  id="login"
                  type="text"
                  autoComplete="username"
                  placeholder="login"
                  required
                  minLength={5}
                  maxLength={12}
                  title="login: 5-12 characters (letters, digits, _ and -)"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  className={inputClassName}
                  {...form.register("login")}
               />
               <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="password"
                  required
                  minLength={6}
                  maxLength={24}
                  title="password: 6-24 characters (letters, digits, _ and -)"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  className={inputClassName}
                  {...form.register("password")}
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
                     onCopy={(e) => e.preventDefault()}
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
               id="submitBtn"
               type="submit"
               disabled={!submitEnabled}
               className="mt-[10px] h-10 w-full max-w-[340px] rounded-full border border-[rgba(214,154,255,0.42)] bg-[rgba(117,61,255,0.82)] text-[18px] font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_42px_rgba(186,85,211,0.22)] transition-[transform,box-shadow,filter,opacity] duration-150 enabled:cursor-pointer hover:bg-[rgba(117,61,255,0.88)] enabled:hover:-translate-y-px enabled:hover:shadow-[0_22px_52px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_22px_56px_rgba(117,61,255,0.24)] enabled:hover:[filter:brightness(1.06)] enabled:active:translate-y-0 enabled:active:[filter:brightness(0.94)] disabled:opacity-60 disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)]"
            >
               {mutation.isPending ? "Signing in..." : "Register or Login"}
            </Button>

            <button
               type="button"
               className="mt-[4px] cursor-pointer select-none text-[14px] font-normal text-[rgba(227,190,255,0.80)] transition-colors duration-150 hover:text-white"
               onClick={() => {
                  forgot.setForgotMode("email");
                  setCaptchaReady(false);
                  setUseTurnstile(false);
               }}
            >
               forgot password?
            </button>
         </form>
      </div>
   );
}