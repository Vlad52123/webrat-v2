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

type ForgotMode = false | "email" | "code";

export function LoginForm() {
   const captchaRef = useRef<SliderCaptchaHandle | null>(null);
   const [useTurnstile, setUseTurnstile] = useState(false);
   const [captchaReady, setCaptchaReady] = useState(false);
   const [inputsError, setInputsError] = useState(false);

   // Forgot password state
   const [forgotMode, setForgotMode] = useState<ForgotMode>(false);
   const [forgotEmail, setForgotEmail] = useState("");
   const [forgotCode, setForgotCode] = useState("");
   const [forgotNewPassword, setForgotNewPassword] = useState("");
   const [forgotLoading, setForgotLoading] = useState(false);

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

   // ── Forgot password: Send Code ──
   const handleForgotSendCode = useCallback(async () => {
      const login = String(form.getValues("login") || "").trim();
      const email = forgotEmail.trim();
      if (!login || !email) {
         showToast("error", "Enter your login and email");
         return;
      }
      setForgotLoading(true);
      try {
         const res = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, email }),
         });
         if (res.status === 404) {
            showToast("error", "Account not found or email doesn't match");
            return;
         }
         if (res.status === 429) {
            showToast("error", "Too many requests, try later");
            return;
         }
         if (!res.ok) {
            showToast("error", "Failed to send reset code");
            return;
         }
         showToast("success", "Code sent to your email");
         setForgotMode("code");
      } catch {
         showToast("error", "Network error");
      } finally {
         setForgotLoading(false);
      }
   }, [forgotEmail, form]);

   // ── Forgot password: Reset Password ──
   const handleForgotReset = useCallback(async () => {
      const login = String(form.getValues("login") || "").trim();
      const code = forgotCode.trim();
      const newPw = forgotNewPassword.trim();
      if (!login || !code || !newPw) {
         showToast("error", "Fill in all fields");
         return;
      }
      if (!/^[A-Za-z0-9_-]{6,24}$/.test(newPw)) {
         showToast("error", "Password: 6-24 chars (letters, digits, _ -)");
         return;
      }
      setForgotLoading(true);
      try {
         const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, code, new_password: newPw }),
         });
         if (res.status === 401) {
            showToast("error", "Invalid or expired code");
            return;
         }
         if (!res.ok) {
            showToast("error", "Failed to reset password");
            return;
         }
         showToast("success", "Password reset! You can now login.");
         setForgotMode(false);
         setForgotEmail("");
         setForgotCode("");
         setForgotNewPassword("");
         form.setValue("password", "");
      } catch {
         showToast("error", "Network error");
      } finally {
         setForgotLoading(false);
      }
   }, [forgotCode, forgotNewPassword, form]);

   const backToLogin = useCallback(() => {
      setForgotMode(false);
      setForgotEmail("");
      setForgotCode("");
      setForgotNewPassword("");
      setCaptchaReady(false);
      setUseTurnstile(false);
   }, []);

   // ── Forgot Mode: "email" — enter login + email to receive code ──
   if (forgotMode === "email") {
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

   // ── Forgot Mode: "code" — enter code + new password ──
   if (forgotMode === "code") {
      return (
         <div className="relative w-full grid justify-items-center">
            <div className="grid w-full gap-[10px] justify-items-center">
               <div className="text-center text-[11px] font-bold uppercase tracking-[3px] text-[rgba(255,255,255,0.45)] mb-[4px]">
                  E N T E R&ensp;C O D E
               </div>

               <div className="grid w-full max-w-[380px] grid-cols-1 gap-2.5">
                  <Input
                     id="forgotCode"
                     type="text"
                     autoComplete="one-time-code"
                     placeholder="verification code"
                     required
                     value={forgotCode}
                     onChange={(e) => setForgotCode(e.target.value)}
                     className={inputClassName}
                  />
                  <Input
                     id="forgotNewPassword"
                     type="password"
                     autoComplete="new-password"
                     placeholder="new password"
                     required
                     minLength={6}
                     maxLength={24}
                     value={forgotNewPassword}
                     onChange={(e) => setForgotNewPassword(e.target.value)}
                     className={inputClassName}
                  />
               </div>

               <Button
                  type="button"
                  disabled={forgotLoading || !forgotCode.trim() || !forgotNewPassword.trim()}
                  onClick={handleForgotReset}
                  className="mt-[10px] h-10 w-full max-w-[340px] rounded-full border border-[rgba(214,154,255,0.42)] bg-[rgba(117,61,255,0.82)] text-[18px] font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_42px_rgba(186,85,211,0.22)] transition-[transform,box-shadow,filter,opacity] duration-150 enabled:cursor-pointer hover:bg-[rgba(117,61,255,0.88)] enabled:hover:-translate-y-px enabled:hover:shadow-[0_22px_52px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_22px_56px_rgba(117,61,255,0.24)] enabled:hover:[filter:brightness(1.06)] enabled:active:translate-y-0 enabled:active:[filter:brightness(0.94)] disabled:opacity-60 disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)]"
               >
                  {forgotLoading ? "Resetting..." : "Reset"}
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

   // ── Normal login mode ──
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
                  setForgotMode("email");
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