"use client";

import { useMemo } from "react";

import type { PanelTabKey } from "../hooks/use-panel-tab";
import { cn } from "../../../lib/utils";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";
import { usePanelDetailView } from "../panel/detail/panel-detail-view-provider";
import { useVictimsTablePrefs } from "../panel/victims-table/victims-table-prefs-provider";

export function PanelTopbar(props: {
    tab: PanelTabKey;
    filter: VictimsFilter;
    onFilterChange: (next: VictimsFilter) => void;
    settingsTab?: SettingsTabKey;
    onSettingsTabChange?: (next: SettingsTabKey) => void;
}) {
    const { tab, filter, onFilterChange, settingsTab, onSettingsTabChange } = props;
    const detail = usePanelDetailView();
    const victimsPrefs = useVictimsTablePrefs();

    const isPanel = tab === "panel";
    const isSettings = tab === "settings";
    const isCommunity = tab === "community";
    const isBuilder = tab === "builder";
    const isShop = tab === "shop";

    const settingsHostStyle = useMemo(() => ({ display: isSettings ? "block" : "none" }), [isSettings]);
    const communityHostStyle = useMemo(() => ({ display: isCommunity ? "block" : "none" }), [isCommunity]);
    const builderHostStyle = useMemo(() => ({ display: isBuilder ? "block" : "none" }), [isBuilder]);
    const shopMiniStyle = useMemo(() => ({ display: isShop ? "inline-flex" : "none" }), [isShop]);

    const filterBtnClass = (active: boolean) =>
        cn(
            "min-w-[46px] px-[10px] py-[4px] text-[13px] font-semibold text-white/[0.92] transition-[background,transform,color] cursor-pointer select-none wc-no-copy",
            "hover:bg-white/[0.06] hover:text-white/[0.98]",
            active && "bg-white/[0.08] text-white shadow-[inset_0_-2px_0_var(--line),inset_0_1px_0_rgba(255,255,255,0.08)]",
        );

    const pillClass = (active: boolean) =>
        cn(
            "inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-[rgba(20,20,20,0.35)] px-[12px] py-[7px] cursor-pointer select-none",
            "text-[14px] font-bold text-white/[0.92] transition-[background,border-color,transform] wc-no-copy",
            "hover:bg-white/[0.06] hover:border-white/[0.22]",
            active && "bg-white/[0.10] border-white/[0.30]",
        );

    return (
        <header className="relative flex flex-col">
            <div
                className={cn(
                    "relative flex h-[52px] items-center justify-start px-4",
                    "border-t-[3px] border-t-[var(--line)] border-b border-b-white/[0.14]",
                    "bg-[rgba(18,18,18,0.78)] shadow-[0_8px_20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.02)]",
                    "backdrop-blur-[10px]",
                )}
            >
                <div className="flex items-center">
                    {isPanel && !detail.isOpen && (
                        <div className="ml-[6px] inline-flex items-center">
                            <div
                                className="inline-flex overflow-hidden rounded-[14px] border border-white/[0.18] bg-[rgba(18,18,18,0.55)] shadow-[0_10px_26px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[10px]"
                                style={{ borderBottom: "3px solid var(--line)" }}
                            >
                                <button
                                    id="filterOnline"
                                    className={cn(filterBtnClass(filter === "online"), "border-r border-white/15")}
                                    type="button"
                                    onClick={() => onFilterChange("online")}
                                >
                                    online
                                </button>
                                <button
                                    id="filterAll"
                                    className={cn(
                                        filterBtnClass(filter === "all"),
                                        "min-w-[34px] border-r border-white/15 px-[8px]",
                                    )}
                                    type="button"
                                    onClick={() => onFilterChange("all")}
                                >
                                    all
                                </button>
                                <button
                                    id="filterOffline"
                                    className={filterBtnClass(filter === "offline")}
                                    type="button"
                                    onClick={() => onFilterChange("offline")}
                                >
                                    offline
                                </button>
                            </div>

                            <button
                                id="filterOptionsBtn"
                                type="button"
                                aria-label="filter options"
                                className="ml-[10px] inline-grid h-[32px] w-[38px] cursor-pointer place-items-center overflow-hidden rounded-[10px] border border-white/[0.14] bg-transparent p-0 text-white backdrop-blur-[8px] transition-[background,border-color,transform] duration-150 hover:bg-white/[0.08] hover:border-white/[0.2]"
                                onClick={() => {
                                    if (victimsPrefs.isFilterModalOpen) {
                                        victimsPrefs.closeFilterModal();
                                    } else {
                                        victimsPrefs.openFilterModal();
                                    }
                                }}
                            >
                                <img
                                    src="/icons/filter.svg"
                                    alt="filter"
                                    draggable={false}
                                    className="h-[18px] w-[18px] object-contain opacity-100 [filter:brightness(0)_invert(1)] wc-no-copy"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </button>
                        </div>
                    )}
                </div>

                <button id="shopHeaderMini" type="button" style={shopMiniStyle} className={cn(pillClass(true), "ml-[10px] mt-[2px]")}>
                    Your Subs
                </button>

                <div id="settingsTabsHost" style={settingsHostStyle} className="ml-[10px] mt-[2px]">
                    <div className="flex items-center gap-2" role="tablist" aria-label="Settings tabs">
                        <button
                            id="settingsTabPersonalization"
                            className={pillClass((settingsTab ?? "personalization") === "personalization")}
                            type="button"
                            data-settings-tab="personalization"
                            onClick={() => onSettingsTabChange?.("personalization")}
                        >
                            <span className="select-none">Personalization</span>
                        </button>
                        <button
                            id="settingsTabSecurity"
                            className={pillClass((settingsTab ?? "personalization") === "security")}
                            type="button"
                            data-settings-tab="security"
                            onClick={() => onSettingsTabChange?.("security")}
                        >
                            <span className="select-none">Security</span>
                        </button>
                    </div>
                </div>

                <div id="communityTabsHost" style={communityHostStyle} className="ml-[10px] mt-[2px]">
                    <div className="flex items-center gap-2" role="tablist" aria-label="Community tabs">
                        <button
                            id="communityTabInformation"
                            className={pillClass(true)}
                            type="button"
                            data-community-tab="information"
                        >
                            <span className="select-none">Information</span>
                        </button>
                    </div>
                </div>

                <div id="builderTabsHost" style={builderHostStyle} className="ml-[10px] mt-[2px]">
                    <div className="flex items-center gap-2" role="tablist" aria-label="Builder tabs">
                        <button
                            id="builderTabBuilds"
                            className={pillClass(true)}
                            type="button"
                            data-builder-tab="builds"
                        >
                            <span className="select-none">Builds</span>
                        </button>
                    </div>
                </div>

                {!isBuilder && !isSettings && !isCommunity && !isShop && !detail.isOpen && (
                    <div className="pointer-events-none absolute left-1/2 top-[6px] hidden h-[40px] w-[min(560px,70vw)] translate-x-[calc(-50%+60px)] items-center justify-center md:flex">
                        <span className="whitespace-nowrap rounded-full border px-[18px] py-[6px] text-[15px] font-bold text-white/[0.96] shadow-[0_0_0_1px_rgba(0,0,0,0.8)]" style={{ borderColor: "var(--line)" }}>
                            Welcome to WebCrystal Beta v1.2026!
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}
