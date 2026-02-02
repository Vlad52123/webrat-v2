"use client";

import { useState } from "react";

import { usePanelTab } from "../hooks/use-panel-tab";
import { BuilderScreen } from "../screens/builder-screen";
import { CommunityScreen } from "../screens/community-screen";
import { PanelScreen } from "../screens/panel-screen";
import { SettingsScreen } from "../screens/settings-screen";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";
import { PanelSidebar } from "./panel-sidebar";
import { PanelTopbar } from "./panel-topbar";

export function PanelShell() {
  const { tab } = usePanelTab();
  const [victimsFilter, setVictimsFilter] = useState<VictimsFilter>("all");
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("personalization");

  return (
    <div className="min-h-screen bg-[#222222] text-white/90">
      <div className="grid h-screen grid-cols-[46px_1fr]">
        <PanelSidebar tab={tab} />

        <div className="flex min-w-0 flex-col" aria-label="Main">
          <PanelTopbar
            tab={tab}
            filter={victimsFilter}
            onFilterChange={setVictimsFilter}
            settingsTab={settingsTab}
            onSettingsTabChange={setSettingsTab}
          />

          <main className="relative min-h-0 flex-1 overflow-hidden">
            {tab === "panel" && <PanelScreen filter={victimsFilter} />}
            {tab === "builder" && <BuilderScreen />}
            {tab === "community" && <CommunityScreen />}
            {tab === "settings" && <SettingsScreen tab={settingsTab} />}
          </main>
        </div>
      </div>
    </div>
  );
}