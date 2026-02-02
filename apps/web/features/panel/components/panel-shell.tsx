"use client";

import { useEffect, useRef, useState } from "react";

import { usePanelTab } from "../hooks/use-panel-tab";
import { BuilderScreen } from "../screens/builder-screen";
import { CommunityScreen } from "../screens/community-screen";
import { PanelScreen } from "../screens/panel-screen";
import { ShopScreen } from "../screens/shop-screen";
import { SettingsScreen } from "../screens/settings-screen";
import { PanelSettingsProvider } from "../settings";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";
import { PanelSidebar } from "./panel-sidebar";
import { PanelTopbar } from "./panel-topbar";

export function PanelShell() {
  const { tab, setTab } = usePanelTab();
  const [victimsFilter, setVictimsFilter] = useState<VictimsFilter>("all");
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("personalization");
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      document.body.classList.toggle("isShopTab", tab === "shop");
    } catch {
    }
  }, [tab]);

  return (
    <PanelSettingsProvider contentRef={contentRef}>
      <div className="min-h-screen bg-[#222222] text-white/90">
        <div className="grid h-screen grid-cols-[46px_1fr]">
          <PanelSidebar tab={tab} setTab={setTab} />

          <div className="flex min-w-0 flex-col" aria-label="Main">
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
          </div>
        </div>
      </div>
    </PanelSettingsProvider>
  );
}