"use client";

import { useEffect, useState } from "react";

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

   return (
      <div
         className={[
            "relative w-full h-0 overflow-visible",
            open ? "pointer-events-auto" : "pointer-events-none",
            type === "error" ? "isError" : type === "warning" ? "isWarning" : "isInfo",
         ].join(" ")}
         aria-live="polite"
         aria-atomic="true"
      >
         <div
            className={[
               "absolute left-0 right-0 top-full z-50 grid place-items-center border px-3 py-3 rounded-t-2xl rounded-b-none",
               "bg-[rgba(255,70,70,0.92)] text-black shadow-[0_16px_44px_rgba(0,0,0,0.40)]",
               "transition-[transform,opacity] duration-220",
               open ? "translate-y-[10px] opacity-100" : "-translate-y-full opacity-0",
            ].join(" ")}
         >
            <div className="min-w-0 text-center text-[16px] font-black leading-6 text-black/95 break-words">
               {message}
            </div>
         </div>
      </div>
   );
}