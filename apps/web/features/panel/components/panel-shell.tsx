"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { usePanelTab } from "../hooks/use-panel-tab";
import { useSubscriptionQuery } from "../hooks/use-subscription-query";
import { PanelDetailViewProvider, usePanelDetailView } from "../panel/detail/panel-detail-view-provider";
import { useVictimsTablePrefs, VictimsTablePrefsProvider } from "../panel/victims-table/victims-table-prefs-provider";
import { PanelScreen } from "../screens/panel-screen";
import { PanelSettingsProvider } from "../settings";
import { installToastGlobal } from "../toast";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";
import { PanelWsProvider } from "../ws/ws-provider";
import { PanelSidebar } from "./panel-sidebar";
import { PanelTopbar } from "./panel-topbar";

const BuilderScreen = dynamic(
  () => import("../screens/builder-screen").then((m) => m.BuilderScreen),
  { ssr: false },
);

const ShopScreen = dynamic(
  () => import("../screens/shop-screen").then((m) => m.ShopScreen),
  { ssr: false },
);

const CommunityScreen = dynamic(
  () => import("../screens/community-screen").then((m) => m.CommunityScreen),
  { ssr: false },
);

const SettingsScreen = dynamic(
  () => import("../screens/settings-screen").then((m) => m.SettingsScreen),
  { ssr: false },
);

export function PanelShell() {
  return (
    <PanelWsProvider>
      <PanelDetailViewProvider>
        <VictimsTablePrefsProvider>
          <PanelShellInner />
        </VictimsTablePrefsProvider>
      </PanelDetailViewProvider>
    </PanelWsProvider>
  );
}

function PanelShellInner() {
  const { tab, setTab } = usePanelTab();
  const subQ = useSubscriptionQuery();
  const detail = usePanelDetailView();
  const victimsPrefs = useVictimsTablePrefs();
  const [victimsFilter, setVictimsFilter] = useState<VictimsFilter>("all");
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("personalization");
  const contentRef = useRef<HTMLElement | null>(null);

  const isVip = useMemo(() => {
    const st = String(subQ.data?.status || "").toLowerCase();
    return st === "vip";
  }, [subQ.data?.status]);

  const isSubSettled = subQ.isSuccess || subQ.isError;
  const isRestrictedTab = tab === "panel" || tab === "builder";
  const isBlockedRestrictedTab = isSubSettled && isRestrictedTab && !isVip;
  const isPendingRestrictedTab = !isSubSettled && isRestrictedTab;

  const displayTab = isBlockedRestrictedTab ? "shop" : tab;

  const guardedSetTab = useCallback(
    (next: Parameters<typeof setTab>[0]) => {
      if (typeof next !== "string") return;
      const restrictedNext = next === "panel" || next === "builder";
      if (isSubSettled && !isVip && restrictedNext) {
        setTab("shop");
        return;
      }
      setTab(next);
    },
    [isSubSettled, isVip, setTab],
  );

  useEffect(() => {
    if (!isSubSettled) return;
    if (!isVip && isRestrictedTab) {
      guardedSetTab("shop");
    }
  }, [guardedSetTab, isRestrictedTab, isSubSettled, isVip]);

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

  if (isPendingRestrictedTab) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#222222] text-white/80">
        <div className="grid place-items-center">
          <img
            src="/icons/loading.svg"
            alt="loading"
            draggable={false}
            className="h-[44px] w-[44px] animate-spin invert brightness-200"
          />
          <span className="sr-only">Checking subscription</span>
        </div>
      </div>
    );
  }

  return (
    <PanelSettingsProvider contentRef={contentRef}>
      <div className="min-h-screen bg-[#222222] text-white/90">
        <div className={detail.isOpen ? "grid h-screen grid-cols-[64px_1fr]" : "grid h-screen grid-cols-[46px_1fr]"}>
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
              {displayTab === "panel" && <PanelScreen filter={victimsFilter} />}
              {displayTab === "builder" && <BuilderScreen />}
              {displayTab === "shop" && <ShopScreen />}
              {displayTab === "community" && <CommunityScreen />}
              {displayTab === "settings" && <SettingsScreen tab={settingsTab} />}
            </section>
          </main>
        </div>
      </div>
    </PanelSettingsProvider>
  );
}