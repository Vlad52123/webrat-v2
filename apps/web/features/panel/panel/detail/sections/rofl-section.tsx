"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { bindRoflActions } from "./rofl/bind-rofl-actions";

const CARD =
    "rofl-card w-[420px] max-w-[calc(100vw-420px)] ml-[4px] rounded-[18px] border border-white/[0.14] " +
    "bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]";

const BTN =
    "min-w-[120px] cursor-pointer rounded-[12px] border border-white/[0.18] bg-[rgba(30,30,30,0.85)] " +
    "px-[22px] pb-[4px] pt-[6px] text-[14px] font-[800] uppercase tracking-[0.05em] text-[#f5f5f5] " +
    "shadow-[0_10px_24px_rgba(0,0,0,0.7)] " +
    "transition-[background,border-color,border-bottom-color,color,transform,box-shadow] duration-[120ms] " +
    "hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:text-white hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)]";

export function RoflSection() {
    const detail = usePanelDetailView();
    const ws = usePanelWS();
    const qc = useQueryClient();

    useEffect(() => {
        return bindRoflActions({
            selectedVictimId: detail.selectedVictimId,
            qc,
            ws,
        });
    }, [detail.selectedVictimId, qc, ws]);

    return (
        <div className="detail-section h-[100dvh] overflow-y-auto pb-[60px]" data-section="rofl">
            {/* Open URL */}
            <div className={CARD} style={{ marginTop: "8px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Open url</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="grid grid-cols-[1fr_max-content] items-stretch gap-[10px]">
                        <input
                            id="roflUrlInput"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="URL"
                        />
                        <button id="roflOpenBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>
                            Open
                        </button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Change background */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Change the background</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="grid grid-cols-[1fr_max-content] items-stretch gap-[10px]">
                        <input
                            id="roflBgUrlInput"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="URL"
                        />
                        <button id="roflChangeBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>
                            Change
                        </button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Block input */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Block input</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflBlockOnBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn on</button>
                        <button id="roflBlockOffBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn off</button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Shake screen */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Shake screen</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflShakeOnBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn on</button>
                        <button id="roflShakeOffBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn off</button>
                    </div>
                </div>
            </div>

            {/* Message box */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Message box</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />

                    <div className="grid grid-cols-[90px_1fr] items-center gap-[10px] my-[8px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Icon:</div>
                        <select
                            id="roflMsgIcon"
                            className="h-[32px] rounded-[10px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] px-[10px] text-[13px] font-semibold text-white/80 outline-none cursor-pointer transition-all hover:bg-white/[0.07] hover:border-white/[0.18] hover:text-white appearance-none"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.5)' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 10px center"
                            }}
                        >
                            <option value="info" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>Info</option>
                            <option value="error" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>Error</option>
                            <option value="warning" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>Warning</option>
                            <option value="question" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>Question</option>
                            <option value="none" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>None</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-center gap-[10px] my-[8px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Header:</div>
                        <input
                            id="roflMsgHeader"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="Header text"
                        />
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-start gap-[10px] my-[8px]">
                        <div className="pt-[6px] text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Content:</div>
                        <textarea
                            id="roflMsgContent"
                            rows={3}
                            className="min-h-[72px] max-h-[160px] resize-none rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="Message content"
                        />
                    </div>

                    <div className="mt-[4px] h-[2px] bg-[var(--line)]" />

                    <div className="mt-[14px] grid grid-cols-[90px_minmax(140px,220px)_max-content] items-center gap-x-[12px] gap-y-[10px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Buttons:</div>
                        <select
                            id="roflMsgButtons"
                            className="h-[32px] rounded-[10px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] px-[10px] text-[13px] font-semibold text-white/80 outline-none cursor-pointer transition-all hover:bg-white/[0.07] hover:border-white/[0.18] hover:text-white appearance-none"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.5)' d='M6 8L2 4h8z'/%3E%3C/svg%3E\")",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 10px center"
                            }}
                        >
                            <option value="ok" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>OK</option>
                            <option value="okcancel" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>OK / Cancel</option>
                            <option value="yesno" style={{ background: "rgba(16,16,16,0.96)", color: "white" }}>Yes / No</option>
                            <option value="yesnocancel" style={{ background:
                </div>
            </div>

            {/* Swap Mouse Buttons */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Swap Mouse Buttons</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflSwapLeftRightBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Left | Right</button>
                        <button id="roflSwapRightLeftBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Right | Left</button>
                    </div>
                </div>
            </div>

            {/* Reboot */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Reboot</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflBsodBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>BSoD</button>
                        <button id="roflVoltageBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>VOLTAGE DROP</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
