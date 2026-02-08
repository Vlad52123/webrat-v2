"use client";

import { memo } from "react";

import type { CommunityItem } from "../types";
import { CommunityItemDetails } from "./community-item-details";

export const CommunityItemCard = memo(function CommunityItemCard(props: {
   item: CommunityItem;
   isOpen: boolean;
   messageCount: number;
   enterShake: boolean;
   onToggle: (key: string) => void;
}) {
   const { item, isOpen, messageCount, enterShake, onToggle } = props;

   return (
      <div
         className={
            "grid cursor-pointer grid-cols-[64px_1fr] items-start gap-[14px] rounded-[14px] border border-white/20 bg-[rgba(32,32,32,0.42)] px-[20px] py-[18px] shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[10px] transition-[background,border-color,transform] duration-[140ms] ease-out hover:translate-y-[-2px] hover:bg-[rgba(40,40,40,0.5)] hover:border-[rgba(235,200,255,0.26)]"
         }
         onClick={() => onToggle(item.key)}
      >
         <div className="grid h-[56px] w-[56px] select-none place-items-center overflow-hidden rounded-[10px] border border-white/20 bg-[rgba(25,25,25,0.55)]">
            <img
               className={"h-[56px] w-[56px] object-cover " + (enterShake ? "wc-community-logo-shake" : "")}
               src="/logo/main_logo.ico"
               alt="logo"
               draggable={false}
            />
         </div>

         <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
               <div className="min-w-0">
                  <div className="text-[15px] font-extrabold leading-[1.15] text-[rgb(240,105,236)]">{item.title}</div>
                  <div className="mt-[2px] text-[12px] text-white/70">{item.author}</div>
               </div>
               <div className="shrink-0 whitespace-nowrap text-[12px] text-white/70">{item.date}</div>
            </div>

            <div
               className={
                  "mt-3 overflow-hidden border-t border-white/10 " + (isOpen ? "" : "hidden")
               }
               style={{ contain: "layout paint" }}
            >
               {isOpen ? (
                  <div
                     className="animate-in fade-in slide-in-from-top-2 duration-[160ms]"
                     style={{ willChange: "transform, opacity" }}
                  >
                     <CommunityItemDetails item={item} />
                  </div>
               ) : null}
            </div>

            <div className="mt-[10px] text-right text-[12px] text-white/55">Messages: {messageCount}</div>
         </div>
      </div>
   );
});