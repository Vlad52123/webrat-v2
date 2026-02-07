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
               "relative grid grid-cols-[1fr_30px] items-center gap-2.5 rounded-2xl border px-3 py-3",
               "bg-[rgba(255,70,70,0.92)] text-black shadow-[0_16px_44px_rgba(0,0,0,0.40)]",
            ].join(" ")}
         >
            <div className="min-w-0">
               <div className="text-left text-base font-black tracking-[0.2px] text-black/95">{title}</div>
               <div className="text-left text-sm leading-5 text-black/90 break-words">{message}</div>
            </div>

            <button
               type="button"
               aria-label="Close"
               onClick={() => setOpen(false)}
               className="grid size-[30px] place-items-center rounded-full border border-black/15 bg-black/5 text-lg leading-none text-black/90 hover:bg-black/10"
            >
               ×
            </button>
         </div>
      </div>
   );
}