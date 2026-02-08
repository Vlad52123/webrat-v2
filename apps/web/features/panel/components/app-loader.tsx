"use client";

import { cn } from "../../../lib/utils";

export function AppLoader(props: { label?: string; className?: string; fullScreen?: boolean }) {
   const { label = "Loading", className, fullScreen } = props;

   return (
      <div
         className={cn(
            fullScreen ? "grid h-[100dvh] w-full place-items-center overflow-hidden bg-[#222222] text-white/80" : "grid w-full place-items-center",
            className,
         )}
         aria-label={label}
      >
         <div className="grid w-[190px] place-items-center gap-2 rounded-[16px] border border-white/[0.12] bg-[rgba(18,18,18,0.62)] p-[16px_18px] shadow-[0_18px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[10px]">
            <div
               className="h-[44px] w-[44px] animate-spin rounded-full border-[3px] border-white/15 border-t-white/70"
               aria-hidden="true"
            />

            <div className="text-[14px] font-bold tracking-[0.02em] text-white/85" aria-hidden="true">
               {label}
            </div>

            <div className="inline-flex h-[10px] items-center gap-[6px]" aria-hidden="true">
               <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white/55" />
               <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white/55" style={{ animationDelay: "140ms" }} />
               <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white/55" style={{ animationDelay: "280ms" }} />
            </div>

            <span className="sr-only">{label}</span>
         </div>
      </div>
   );
}
