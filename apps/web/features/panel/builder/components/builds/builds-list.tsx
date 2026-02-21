"use client";

import { useEffect, useMemo, useState } from "react";

import {
    MODAL_OVERLAY_FLEX,
    MODAL_CARD_340,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CLOSE_ICON,
    MODAL_CONFIRM_BTN,
    MODAL_CANCEL_BTN,
} from "../../../ui-classes";
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
            <div id="buildsList" className="builds-list mt-[22px] ml-[32px] mr-[32px] max-h-[calc(100vh-320px)] overflow-y-auto pr-[8px]">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,380px))] gap-[12px] pb-[12px]">
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
            </div>

            {pendingDeleteId && (
                <div
                    className={MODAL_OVERLAY_FLEX}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setPendingDeleteId(null);
                    }}
                >
                    <div
                        className={MODAL_CARD_340}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Confirm delete"
                    >
                        <div className={MODAL_HEADER}>
                            <div className="text-[15px] font-bold text-white">Delete build</div>
                            <button
                                className={MODAL_CLOSE_BTN}
                                type="button"
                                aria-label="Close"
                                onClick={() => setPendingDeleteId(null)}
                            >
                                <span aria-hidden="true" className={MODAL_CLOSE_ICON}>×</span>
                            </button>
                        </div>
                        <div className="grid gap-[12px] p-[18px]">
                            <div className="text-center text-[14px] text-white/[0.9]">
                                Are you sure you want to delete this build?
                            </div>
                            <div className="mt-[4px] flex justify-center gap-[12px]">
                                <button
                                    className={MODAL_CONFIRM_BTN}
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
                                    className={MODAL_CANCEL_BTN}
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
