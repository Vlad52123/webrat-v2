import { useMemo } from "react";

export function BuilderToggle(props: { open: boolean; onToggle: () => void }) {
   const { open, onToggle } = props;

   const toggleText = useMemo(() => (open ? "Close builder" : "Create new build"), [open]);

   return (
      <button
         id="builderToggle"
         className={
            "builderToggle relative w-full cursor-pointer appearance-none rounded-[999px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.35)] px-[14px] py-[8px] text-center text-[16px] font-bold text-[rgba(255,255,255,0.92)] transition-[background,border-color,transform] duration-[140ms] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.18)] active:translate-y-[1px] after:content-[''] after:absolute after:left-[6px] after:bottom-[2px] after:h-[2px] after:w-[calc(100%-12px)] after:rounded-[999px] after:bg-[var(--line)] after:opacity-[0.95] hover:after:bg-[rgba(255,255,255,0.9)]"
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
