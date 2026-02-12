import { useMemo } from "react";

export function BuilderToggle(props: { open: boolean; onToggle: () => void }) {
   const { open, onToggle } = props;

   const toggleText = useMemo(() => (open ? "Close builder" : "Create new build"), [open]);

   return (
      <button
         id="builderToggle"
         className={
            "builderToggle relative w-full cursor-pointer appearance-none rounded-[14px] border bg-[rgba(22,22,26,0.5)] px-[14px] py-[10px] text-center text-[15px] font-bold tracking-[0.3px] transition-all duration-[180ms] active:translate-y-[1px] " +
            (open
               ? "border-[rgba(255,255,255,0.14)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.18)]"
               : "border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.92)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(186,85,211,0.25)] hover:shadow-[0_0_20px_rgba(186,85,211,0.08)]") +
            " after:content-[''] after:absolute after:left-[8px] after:bottom-[3px] after:h-[2px] after:w-[calc(100%-16px)] after:rounded-[999px] after:bg-[var(--line)] after:opacity-80 hover:after:opacity-100 after:transition-opacity after:duration-[180ms]"
         }
         type="button"
         onClick={onToggle}
      >
         <span id="builderToggleText" className="builderToggleText">
            {toggleText}
         </span>
      </button>
   );
}