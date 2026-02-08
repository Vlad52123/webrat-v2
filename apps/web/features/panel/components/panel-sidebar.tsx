"use client";

import type { PanelTabKey } from "../hooks/use-panel-tab";
import { cn } from "../../../lib/utils";
import { usePanelDetailView } from "../panel/detail/panel-detail-view-provider";

export function PanelSidebar(props: { tab: PanelTabKey; setTab: (next: PanelTabKey) => void }) {
   const { tab, setTab } = props;
   const detail = usePanelDetailView();

   return (
      <aside
         className={cn(
            "grid content-start gap-[2px] border-r border-white/[0.16] bg-[rgba(18,18,18,0.72)] py-2.5",
            "shadow-[8px_0_24px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.02)]",
            "backdrop-blur-[10px]",
            detail.isOpen && "flex flex-col p-0 bg-[#1a1a1a]",
         )}
         aria-label="Sidebar"
      >
         <button
            id="detailBackBtn"
            className={cn(
               "hidden",
               detail.isOpen &&
               "grid flex-1 place-items-center border-none border-r border-[rgba(150,150,150,0.75)] bg-[rgba(30,30,30,0.95)] text-[rgba(200,200,200,0.9)] transition-[background] duration-150 hover:bg-[rgba(45,45,45,0.95)]",
            )}
            type="button"
            aria-label="Back"
            onClick={() => detail.closeDetailView()}
         >
            <img
               src="/icons/arrow.svg"
               alt="back"
               className="h-[30px] w-[30px] opacity-[0.85] wc-sidebar-icon"
               draggable={false}
            />
         </button>

         {detail.isOpen ? null : (
            <>
               <button
                  id="logoBtn"
                  className="grid cursor-pointer place-items-center bg-transparent transition-[filter] duration-150 hover:brightness-[0.92]"
                  type="button"
                  aria-label="Reload"
                  onClick={() => setTab("panel")}
               >
                  <img
                     className="h-auto w-[44px] cursor-pointer select-none [image-rendering:pixelated] [filter:drop-shadow(0_0_0_var(--line))] transition-[filter] duration-150 hover:brightness-[0.92]"
                     src="/logo/main_logo.ico"
                     alt="WebCrystal"
                     draggable={false}
                  />
               </button>

               <div className="h-px w-full bg-white/20" aria-hidden="true" />

               <button
                  id="builderBtn"
                  className={cn(
                     "grid h-[38px] w-full cursor-pointer place-items-center border border-transparent bg-transparent transition-[filter,background,border-color] duration-150 hover:brightness-[0.97]",
                     tab === "builder" &&
                     "rounded-[14px] border-white/[0.18] bg-white/[0.10] shadow-[inset_0_-2px_0_var(--line)]",
                  )}
                  type="button"
                  aria-label="Builder"
                  data-active={tab === "builder"}
                  onClick={() => setTab("builder")}
               >
                  <img
                     className="h-7 w-7 cursor-pointer opacity-[0.85] wc-sidebar-icon"
                     src="/icons/builder.svg"
                     alt="builder"
                     draggable={false}
                  />
               </button>

               <button
                  id="communityBtn"
                  className={cn(
                     "grid h-[38px] w-full cursor-pointer place-items-center border border-transparent bg-transparent transition-[filter,background,border-color] duration-150 hover:brightness-[0.97]",
                     tab === "community" &&
                     "rounded-[14px] border-white/[0.18] bg-white/[0.10] shadow-[inset_0_-2px_0_var(--line)]",
                  )}
                  aria-label="Community"
                  type="button"
                  data-active={tab === "community"}
                  onClick={() => setTab("community")}
               >
                  <img
                     className="h-7 w-7 cursor-pointer opacity-[0.85] wc-sidebar-icon"
                     src="/icons/chat.svg"
                     alt="community"
                     draggable={false}
                  />
               </button>

               <button
                  id="shopBtn"
                  className={cn(
                     "grid h-[38px] w-full cursor-pointer place-items-center border border-transparent bg-transparent transition-[filter,background,border-color] duration-150 hover:brightness-[0.97]",
                     tab === "shop" &&
                     "rounded-[14px] border-white/[0.18] bg-white/[0.10] shadow-[inset_0_-2px_0_var(--line)]",
                  )}
                  aria-label="Shop"
                  type="button"
                  onClick={() => setTab("shop")}
               >
                  <img
                     className="h-7 w-7 cursor-pointer opacity-[0.85] wc-sidebar-icon"
                     src="/icons/shop.svg"
                     alt="shop"
                     draggable={false}
                  />
               </button>

               <button
                  id="settingsBtn"
                  className={cn(
                     "grid h-[38px] w-full cursor-pointer place-items-center border border-transparent bg-transparent transition-[filter,background,border-color] duration-150",
                     tab === "settings" &&
                     "rounded-[14px] border-white/[0.18] bg-white/[0.10] shadow-[inset_0_-2px_0_var(--line)]",
                  )}
                  aria-label="Settings"
                  type="button"
                  data-active={tab === "settings"}
                  onClick={() => setTab("settings")}
               >
                  <img
                     className="h-7 w-7 cursor-pointer opacity-[0.85] wc-sidebar-icon"
                     src="/icons/settings.svg"
                     alt="settings"
                     draggable={false}
                  />
               </button>
            </>
         )}
      </aside>
   );
}