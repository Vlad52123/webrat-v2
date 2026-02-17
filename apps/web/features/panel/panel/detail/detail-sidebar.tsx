"use client";

import type { Victim } from "../../api/victims";
import { DetailNav } from "./detail-nav";
import { DetailStatusCard } from "./detail-status-card";

export function DetailSidebar(props: { victim: Victim | null }) {
    const { victim } = props;

    return (
        <aside
            className={
                "flex flex-col min-h-0 h-full rounded-[14px] border-r border-[rgba(130,130,130,0.6)] bg-[rgba(20,20,22,0.86)] p-[8px_6px] " +
                "shadow-[0_0_0_1px_rgba(0,0,0,0.7)] backdrop-blur-[12px]"
            }
            aria-label="Detail sidebar"
        >
            <div className="overflow-y-auto flex-1">
                <DetailNav />
            </div>
            <DetailStatusCard victim={victim} />
        </aside>
    );
}
