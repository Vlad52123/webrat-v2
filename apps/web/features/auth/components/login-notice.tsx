"use client";

import { useEffect, useMemo, useState } from "react";

export type LoginNoticeType = "error" | "warning" | "info";

export function LoginNotice({
   type,
   message,
   sticky = false,
}: {
   type: LoginNoticeType;
   message: string;
   sticky?: boolean;
}) {
   const [open, setOpen] = useState(true);

   useEffect(() => {
      const t = setTimeout(() => setOpen(true), 0);
      return () => clearTimeout(t);
   }, [type, message]);

   useEffect(() => {
      if (sticky) return;
      const t = setTimeout(() => setOpen(false), 6000);
      return () => clearTimeout(t);
   }, [sticky, type, message]);

   const title = useMemo(() => {
      if (type === "error") return "Error";
      if (type === "warning") return "Warning";
      return "Info";
   }, [type]);

   return (
      <div
         className={[
            "w-full max-w-[380px] overflow-hidden transition-[max-height,transform,opacity,margin-top] duration-240",
            open
               ? "pointer-events-auto mt-[10px] max-h-[140px] translate-y-0 opacity-100"
               : "pointer-events-none mt-0 max-h-0 -translate-y-2 opacity-0",
            type === "error" ? "isError" : type === "warning" ? "isWarning" : "isInfo",
         ].join(" ")}
         aria-live="polite"
         aria-atomic="true"
      >
         <div
            className={[
               "relative grid grid-cols-[34px_1fr_30px] items-center gap-2.5 rounded-2xl border px-3 py-3",
               "bg-[radial-gradient(700px_140px_at_10%_0%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_55%),linear-gradient(180deg,rgba(18,10,34,0.86)_0%,rgba(10,7,18,0.76)_100%)]",
               "shadow-[0_16px_44px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-[14px]",
               type === "error"
                  ? "border-[rgba(255,70,70,0.60)] shadow-[0_18px_55px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,70,70,0.18)_inset,0_0_22px_rgba(255,70,70,0.18)]"
                  : type === "warning"
                     ? "border-[rgba(163,130,255,0.55)] shadow-[0_18px_55px_rgba(0,0,0,0.55),0_0_0_1px_rgba(163,130,255,0.16)_inset,0_0_24px_rgba(117,61,255,0.18)]"
                     : "border-[rgba(117,61,255,0.55)]",
            ].join(" ")}
         >
            <div
               aria-hidden="true"
               className={[
                  "grid size-[30px] place-items-center rounded-full text-base font-black shadow-[0_10px_22px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.12)_inset]",
                  type === "error"
                     ? "bg-[linear-gradient(180deg,rgba(255,120,120,0.95)_0%,rgba(255,70,70,0.90)_100%)] text-white"
                     : type === "warning"
                        ? "bg-[linear-gradient(180deg,rgba(200,175,255,0.95)_0%,rgba(117,61,255,0.92)_100%)] text-white"
                        : "bg-[linear-gradient(180deg,rgba(163,130,255,0.95)_0%,rgba(117,61,255,0.92)_100%)] text-white",
               ].join(" ")}
            >
               !
            </div>

            <div className="min-w-0">
               <div className="text-left text-base font-black tracking-[0.2px] text-white/95">
                  {title}
               </div>
               <div className="text-left text-sm leading-5 text-white/85 break-words">
                  {message}
               </div>
            </div>

            <button
               type="button"
               aria-label="Close"
               onClick={() => setOpen(false)}
               className="grid size-[30px] place-items-center rounded-full border border-white/10 bg-white/8 text-lg leading-none text-white/90 hover:bg-white/14"
            >
               ×
            </button>
         </div>
      </div>
   );
}