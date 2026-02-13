"use client";

import { memo } from "react";

import type { CommunityItem } from "../types";
import { CommunityItemDetails } from "./community-item-details";

const keyIcons: Record<string, string | null> = {
   information: null,
   rules: "/icons/rules.svg",
   updates: "/icons/updates.svg",
};

export const CommunityItemCard = memo(function CommunityItemCard(props: {
   item: CommunityItem;
   isOpen: boolean;
   messageCount: number;
   onToggle: (key: string) => void;
}) {
   const { item, isOpen, messageCount, onToggle } = props;

   const iconSrc = keyIcons[item.key];

   const iconContent = iconSrc ? (
      <img src={iconSrc} alt="" draggable={false} className="h-[22px] w-[22px] select-none pointer-events-none opacity-70 invert" />
   ) : (
      <span className="text-[18px]">ℹ</span>
   );

   return (
      <div
         className={
            "group cursor-pointer rounded-[14px] border transition-all duration-[180ms] ease-out " +
            (isOpen
               ? "border-[rgba(255,255,255,0.14)] bg-[rgba(22,22,26,0.80)] shadow-[0_16px_40px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
               : "border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.55)] shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(22,22,26,0.70)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]") +
            " backdrop-blur-[10px]"
         }
         onClick={() => onToggle(item.key)}
      >
         <div className="flex items-center gap-[14px] px-[20px] py-[16px]">
            <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[20px]">
               {iconContent}
            </div>

            <div className="min-w-0 flex-1">
               <div className="flex items-center justify-between gap-[12px]">
                  <div className="min-w-0">
                     <div className="text-[14px] font-extrabold tracking-[0.2px] text-[rgba(255,255,255,0.92)]">
                        {item.title}
                     </div>
                     <div className="mt-[2px] text-[11px] font-medium text-[rgba(255,255,255,0.35)]">
                        {item.author}
                     </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-[12px]">
                     <span className="text-[11px] font-medium text-[rgba(255,255,255,0.30)]">{item.date}</span>
                     <span className="grid h-[22px] min-w-[22px] place-items-center rounded-[6px] bg-[rgba(255,255,255,0.06)] px-[6px] text-[11px] font-bold text-[rgba(255,255,255,0.50)]">
                        {messageCount}
                     </span>
                     <span
                        className={
                           "text-[10px] text-[rgba(255,255,255,0.35)] transition-transform duration-[200ms] " +
                           (isOpen ? "rotate-180" : "")
                        }
                     >
                        ▼
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {isOpen && (
            <div className="border-t border-[rgba(255,255,255,0.06)] px-[20px] pb-[16px]">
               <CommunityItemDetails item={item} />
            </div>
         )}
      </div>
   );
});