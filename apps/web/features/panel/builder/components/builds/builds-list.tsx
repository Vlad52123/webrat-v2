"use client";

import { useEffect, useMemo, useState } from "react";

import { BuildCard } from "./build-card";
import { useBuilderBuildHistory } from "../../hooks/use-builder-build-history";
import { useVictimsQuery } from "../../../hooks/use-victims-query";
import type { Victim } from "../../../api/victims";

export function BuildsList() {
    const [login] = useState<string>(() => {
        try {
            return String(localStorage.getItem("webrat_login") || "").trim();
        } catch {
            return "";
        }
    });

    const { items, save } = useBuilderBuildHistory(login);

    const victimsQ = useVictimsQuery();

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const victimsCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const victims = (victimsQ.data || []) as Victim[];
        victims.forEach((v) => {
            const vv = v as unknown as { buildId?: unknown; build_id?: unknown; buildID?: unknown };
            const raw = vv.buildId ?? vv.build_id ?? vv.buildID;
            const bid = String(raw || "").trim();
            if (!bid) return;
            counts[bid] = (counts[bid] || 0) + 1;
        });
        return counts;
    }, [victimsQ.data]);

    useEffect(() => {
        if (!items.length) return;
        let changed = false;
        const next = items.map((b) => {
            const newVictims = victimsCounts[b.id] || 0;
            if (b.victims !== newVictims) {
                changed = true;
                return { ...b, victims: newVictims };
            }
            return b;
        });
        if (changed) save(next);
    }, [items, save, victimsCounts]);

    return (
        <>
            <div id="buildsList" className="builds-list mt-[22px] ml-[32px] flex max-w-full flex-wrap gap-[12px]">
                {items.map((b) => (
                    <BuildCard
                        key={b.id}
                        item={b}
                        onDelete={(id) => {
                            setPendingDeleteId(id);
                        }}
                        onInfo={(id) => {
                            const build = items.find((x) => String(x.id) === String(id));
                            if (!build) return;
                            try {
                                window.WebRatCommon?.showToast?.("Info", `Build ${build.name || ""}\nID: ${build.id || ""}`);
                            } catch {
                            }
                        }}
                    />
                ))}
            </div>

            {pendingDeleteId && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/[0.62] backdrop-blur-[10px]"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setPendingDeleteId(null);
                    }}
                >
                    <div
                        className="w-[340px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Confirm delete"
                    >
                        <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
                            <div className="text-[15px] font-bold text-white">Delete build</div>
                            <button
                                className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                                type="button"
                                aria-label="Close"
                                onClick={() => setPendingDeleteId(null)}
                            >
                                <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">×</span>
                            </button>
                        </div>
                        <div className="grid gap-[12px] p-[18px]">
                            <div className="text-center text-[14px] text-white/[0.9]">
                                Are you sure you want to delete this build?
                            </div>
                            <div className="mt-[4px] flex justify-center gap-[12px]">
                                <button
                                    className="min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                                    style={{ borderBottomColor: "var(--line)" }}
                                    type="button"
                                    onClick={() => {
                                        const next = items.filter((x) => x.id !== pendingDeleteId);
                                        save(next);
                                        setPendingDeleteId(null);
                                    }}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.14] bg-white/[0.06] px-[22px] py-[10px] text-[14px] font-semibold text-white/[0.85] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                                    type="button"
                                    onClick={() => setPendingDeleteId(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
