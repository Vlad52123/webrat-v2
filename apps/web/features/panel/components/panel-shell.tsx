"use client";

import { useEffect, useRef, useState } from "react";

import { usePanelTab } from "../hooks/use-panel-tab";
import { PanelDetailViewProvider, usePanelDetailView } from "../panel/detail/panel-detail-view-provider";
import { useVictimsTablePrefs, VictimsTablePrefsProvider } from "../panel/victims-table/victims-table-prefs-provider";
import { BuilderScreen } from "../screens/builder-screen";
import { CommunityScreen } from "../screens/community-screen";
import { PanelScreen } from "../screens/panel-screen";
import { ShopScreen } from "../screens/shop-screen";
import { SettingsScreen } from "../screens/settings-screen";
import { PanelSettingsProvider } from "../settings";
import { installToastGlobal } from "../toast";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";
import { PanelSidebar } from "./panel-sidebar";
import { PanelTopbar } from "./panel-topbar";

export function PanelShell() {
  return (
    <PanelDetailViewProvider>
      <VictimsTablePrefsProvider>
        <PanelShellInner />
      </VictimsTablePrefsProvider>
    </PanelDetailViewProvider>
  );
}

function PanelShellInner() {
  const { tab, setTab } = usePanelTab();
  const detail = usePanelDetailView();
  const victimsPrefs = useVictimsTablePrefs();
  const [victimsFilter, setVictimsFilter] = useState<VictimsFilter>("all");
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("personalization");
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    try {
      document.body.classList.toggle("isPanelTab", tab === "panel");
      document.body.classList.toggle("isBuilderTab", tab === "builder");
      document.body.classList.toggle("isShopTab", tab === "shop");
      document.body.classList.toggle("isCommunityTab", tab === "community");
      document.body.classList.toggle("isSettingsTab", tab === "settings");
    } catch {
    }
  }, [tab]);

  useEffect(() => {
    installToastGlobal();
  }, []);

  useEffect(() => {
    if (tab !== "panel" && detail.isOpen) {
      detail.closeDetailView();
    }
  }, [detail, tab]);

  useEffect(() => {
    if (tab !== "panel" && victimsPrefs.isFilterModalOpen) {
      victimsPrefs.closeFilterModal();
    }
  }, [tab, victimsPrefs]);

  useEffect(() => {
    if (detail.isOpen && victimsPrefs.isFilterModalOpen) {
      victimsPrefs.closeFilterModal();
    }
  }, [detail.isOpen, victimsPrefs]);

  return (
    <PanelSettingsProvider contentRef={contentRef}>
      <div className="min-h-screen bg-[#222222] text-white/90">
        <div className={detail.isOpen ? "grid h-screen grid-cols-[64px_1fr]" : "grid h-screen grid-cols-[46px_1fr]"}>
          <PanelSidebar tab={tab} setTab={setTab} />

          <main
            className="grid min-w-0 grid-rows-[auto_1fr] bg-transparent relative shadow-[inset_0_3px_0_var(--line),inset_0_-3px_0_var(--line)]"
            aria-label="Main"
          >
            <PanelTopbar
              tab={tab}
              filter={victimsFilter}
              onFilterChange={setVictimsFilter}
              settingsTab={settingsTab}
              onSettingsTabChange={setSettingsTab}
            />

            <section ref={contentRef} className="content relative min-h-0 flex-1 overflow-hidden">
              {tab === "panel" && <PanelScreen filter={victimsFilter} />}
              {tab === "builder" && <BuilderScreen />}
              {tab === "shop" && <ShopScreen />}
              {tab === "community" && <CommunityScreen />}
              {tab === "settings" && <SettingsScreen tab={settingsTab} />}
            </section>
          </main>
        </div>
      </div>
    </PanelSettingsProvider>
  );
}