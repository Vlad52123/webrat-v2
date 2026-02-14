"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SliderCaptcha, type SliderCaptchaHandle } from "@/features/auth/components/slider-captcha";

function formatTime(ms: number): string {
   const totalSec = Math.max(0, Math.ceil(ms / 1000));
   const m = Math.floor(totalSec / 60);
   const s = totalSec % 60;
   return `${m}:${String(s).padStart(2, "0")}`;
}

export function SetEmailModal(props: {
   open: boolean;
   onClose: () => void;
   email: string;
   setEmail: (v: string) => void;
   passwordOrCode: string;
   setPasswordOrCode: (v: string) => void;
   step: "input" | "code";
   expiresAt: number;
   onConfirm: () => void;
   currentEmail: string;
   onDetach: (password: string) => void;
}) {
   const {
      open,
      onClose,
      email,
      setEmail,
      passwordOrCode,
      setPasswordOrCode,
      step,
      expiresAt,
      onConfirm,
      currentEmail,
      onDetach,
   } = props;

   const isBound = currentEmail !== "" && currentEmail !== "Not set";
   const [confirmUnbind, setConfirmUnbind] = useState(false);
   const [unbindPassword, setUnbindPassword] = useState("");
   const [remaining, setRemaining] = useState(0);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

   const captchaRef = useRef<SliderCaptchaHandle | null>(null);
   const [captchaReady, setCaptchaReady] = useState(false);

   const handleCaptchaReadyChange = useCallback((ready: boolean) => {
      setCaptchaReady(ready);
   }, []);

   const handleCaptchaError = useCallback((_msg: string) => {
   }, []);

   useEffect(() => {
      if (!open) {
         setConfirmUnbind(false);
         setUnbindPassword("");
         setCaptchaReady(false);
      }
   }, [open]);

   useEffect(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (step !== "code" || !expiresAt) {
         setRemaining(0);
         return;
      }
      const tick = () => {
         const left = expiresAt - Date.now();
         if (left <= 0) {
            setRemaining(0);
            if (timerRef.current) clearInterval(timerRef.current);
         } else {
            setRemaining(left);
         }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => {
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [step, expiresAt]);

   const timerExpired = step === "code" && expiresAt > 0 && remaining <= 0;

   const inputCls =
      "h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]";
   const btnCls =
      "min-w-[130px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]";

   const sendCodeDisabled = step === "input" && !captchaReady;

   const renderBound = () => (
      <div className="grid gap-[12px] p-[18px]">
         <div className="text-center text-[14px] text-white/[0.7]">
            Current email:
         </div>
         <div className="text-center text-[16px] font-bold text-white">
            {currentEmail}
         </div>
         {!confirmUnbind ? (
            <div className="mt-[8px] flex justify-center">
               <button
                  id="emailUnbindBtn"
                  className={btnCls.replace("bg-white/[0.10]", "bg-[rgba(255,75,75,0.12)]").replace("border-white/[0.18]", "border-[rgba(255,75,75,0.35)]")}
                  style={{ borderBottomColor: "rgba(255,75,75,0.95)", color: "#ff7070" }}
                  type="button"
                  onClick={() => setConfirmUnbind(true)}
               >
                  Unbind
               </button>
            </div>
         ) : (
            <div className="grid gap-[10px]">
               <input
                  id="emailUnbindPassword"
                  className={inputCls}
                  type="password"
                  placeholder="Enter password to confirm"
                  value={unbindPassword}
                  onChange={(e) => setUnbindPassword(e.target.value)}
               />
               <div className="flex justify-center gap-[10px]">
                  <button
                     className={btnCls.replace("bg-white/[0.10]", "bg-[rgba(255,75,75,0.12)]").replace("border-white/[0.18]", "border-[rgba(255,75,75,0.35)]")}
                     style={{ borderBottomColor: "rgba(255,75,75,0.95)", color: "#ff7070" }}
                     type="button"
                     onClick={() => onDetach(unbindPassword)}
                  >
                     Unbind
                  </button>
                  <button
                     className={btnCls}
                     style={{ borderBottomColor: "var(--line)" }}
                     type="button"
                     onClick={() => {
                        setConfirmUnbind(false);
                        setUnbindPassword("");
                     }}
                  >
                     Cancel
                  </button>
               </div>
            </div>
         )}
      </div>
   );

   const renderInput = () => (
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

               <div className="w-full">
                  <div className="grid gap-2 rounded-2xl border border-[rgba(117,61,255,0.32)] bg-[rgba(24,14,42,0.52)] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-[14px]">
                     <SliderCaptcha
                        ref={captchaRef}
                        onReadyChange={handleCaptchaReadyChange}
                        onError={handleCaptchaError}
                        onToggleCaptcha={() => { }}
                     />
                  </div>
               </div>
            </>
         )}

         <div className="mt-[4px] flex justify-center">
            <button
               id="emailModalConfirm"
               className={btnCls + ((timerExpired || sendCodeDisabled) ? " opacity-50 pointer-events-none" : "")}
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

   if (!open) return null;

   return (
      <div
         id="emailModalBackdrop"
         className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/[0.62] backdrop-blur-[10px]"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
      >
         <div
            className="w-[420px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emailModalTitle"
         >
            <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
               <div id="emailModalTitle" className="text-[15px] font-bold text-white">
                  {isBound ? "Your email" : "Set email"}
               </div>
               <button
                  id="emailModalClose"
                  className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
               >
                  <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">
                     ×
                  </span>
               </button>
            </div>

            {isBound ? renderBound() : renderInput()}
         </div>
      </div>
   );
}