"use client";

import { cn } from "../../../../lib/utils";

import type { DetailSectionKey } from "../state/detail-section";
import { usePanelDetailView } from "./panel-detail-view-provider";

const NAV: Array<{ key: DetailSectionKey; label: string }> = [
   { key: "information", label: "Information" },
   { key: "remote-start", label: "Remote start" },
   { key: "remote-desktop", label: "Remote desktop" },
   { key: "rofl", label: "Rofl" },
   { key: "terminal", label: "Terminal" },
];

export function DetailNav() {
   const { section, setSection } = usePanelDetailView();

   return (
      <nav className="detail-nav" aria-label="Detail navigation">
         <ul className="m-0 list-none p-0">
            {NAV.map((item) => {
               const active = item.key === section;
               return (
                  <li key={item.key} className={active ? "active" : ""}>
                     <button
                        type="button"
                        onClick={() => setSection(item.key)}
                        className={cn(
                           "relative mb-[7px] flex min-h-[40px] w-full items-center justify-start overflow-hidden whitespace-nowrap rounded-[12px] border px-[14px] py-[9px]",
                           "border-[rgba(150,150,150,0.18)]",
                           "text-[14px] font-[650] leading-[20px] text-[rgba(240,240,240,0.9)]",
                           "bg-[rgba(28,28,34,0.55)] backdrop-blur-[12px]",
                           "shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.04)]",
                           "transition-[background,border-color,transform,box-shadow] duration-[140ms]",
                           "hover:-translate-y-[1px] hover:border-[rgba(200,200,200,0.32)] hover:bg-[rgba(42,42,52,0.65)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                           active &&
                           "border-[rgba(255,255,255,0.35)] bg-[rgba(52,52,64,0.72)] shadow-[0_14px_30px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
                        )}
                     >
                        <span
                           className={cn(
                              "absolute left-[9px] top-[9px] bottom-[9px] w-[3px] rounded-full bg-transparent opacity-90",
                              active && "bg-[var(--line)]",
                           )}
                           aria-hidden="true"
                        />
                        {item.label}
                     </button>
                  </li>
               );
            })}
         </ul>
      </nav>
   );
}