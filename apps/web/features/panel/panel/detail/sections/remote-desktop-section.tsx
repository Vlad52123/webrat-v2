"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { bindRemoteDesktopActions } from "./remote-desktop/bind-remote-desktop-actions";

const SLIDER_CSS = `
   .rd-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 120px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255,255,255,0.15);
      outline: none;
      cursor: pointer;
   }
   .rd-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d4a843;
      border: 2px solid rgba(255,255,255,0.9);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(212,168,67,0.6);
   }
   .rd-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d4a843;
      border: 2px solid rgba(255,255,255,0.9);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(212,168,67,0.6);
   }
   .rd-slider::-webkit-slider-runnable-track {
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #d4a843, rgba(255,255,255,0.15));
   }
   .rd-slider::-moz-range-track {
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #d4a843, rgba(255,255,255,0.15));
   }
`;

function readLocal(key: string, fallback: number): number {
    try {
        const v = localStorage.getItem(key);
        if (v !== null) {
            const n = parseInt(v, 10);
            if (!isNaN(n)) return n;
        }
    } catch { }
    return fallback;
}

function writeLocal(key: string, val: number) {
    try { localStorage.setItem(key, String(val)); } catch { }
}

export function RemoteDesktopSection() {
    const detail = usePanelDetailView();
    const ws = usePanelWS();
    const qc = useQueryClient();

    useEffect(() => {
        return bindRemoteDesktopActions({
            selectedVictimId: detail.selectedVictimId,
            qc,
            ws,
        });
    }, [detail.selectedVictimId, qc, ws]);

    useEffect(() => {
        const soundSlider = document.getElementById("remoteDesktopSound") as HTMLInputElement | null;
        const soundValue = document.getElementById("remoteDesktopSoundValue");

        if (soundSlider) {
            const saved = readLocal("rd_sound", 50);
            soundSlider.value = String(saved);
            if (soundValue) soundValue.textContent = String(saved);
            const onSound = () => {
                const v = parseInt(soundSlider.value, 10);
                if (soundValue) soundValue.textContent = String(v);
                writeLocal("rd_sound", v);
            };
            soundSlider.addEventListener("input", onSound);
            return () => soundSlider.removeEventListener("input", onSound);
        }
    }, []);

    return (
        <div className="detail-section h-full">
            <style>{SLIDER_CSS}</style>
            <div className="relative h-full w-full">
                <div id="remoteDesktopInner" className="relative h-full w-full bg-[#111]">
                    <div
                        id="remoteDesktopPanel"
                        className="group pointer-events-auto absolute left-0 right-0 top-0 z-[5] h-[58px]"
                    >
                        <div
                            id="remoteDesktopToolbar"
                            className={
                                "pointer-events-auto absolute left-[12px] right-[12px] top-[10px] flex h-[34px] items-center justify-between gap-[12px] rounded-[12px] border border-white/[0.14] " +
                                "bg-[rgba(0,0,0,0.46)] p-[6px_10px] shadow-[0_14px_30px_rgba(0,0,0,0.72)] backdrop-blur-[10px] " +
                                "translate-y-[-54px] opacity-0 transition-[transform,opacity] duration-[160ms] ease-out group-hover:translate-y-0 group-hover:opacity-100"
                            }
                        >
                            <div className="w-[24px]" />
                            <div className="flex flex-1 items-center justify-center gap-[18px]">
                                <div className="inline-flex items-center gap-[8px] text-[13px] text-[#e0e0e0]">
                                    <span className="font-semibold">Sound</span>
                                    <input
                                        id="remoteDesktopSound"
                                        className="rd-slider"
                                        type="range"
                                        min={0}
                                        max={100}
                                        defaultValue={readLocal("rd_sound", 50)}
                                    />
                                    <span id="remoteDesktopSoundValue" className="min-w-[26px] text-right font-bold">
                                        {readLocal("rd_sound", 50)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button
                                    id="remoteDesktopStartBtn"
                                    type="button"
                                    className={
                                        "min-w-[120px] cursor-pointer rounded-[12px] border border-white/[0.18] bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] " +
                                        "shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,border-bottom-color,color,transform,box-shadow] duration-[120ms] " +
                                        "hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:text-white hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                                    }
                                    style={{ borderBottom: "4px solid var(--line)" }}
                                >
                                    Start
                                </button>
                            </div>
                        </div>

                        <div
                            id="remoteDesktopToolbarLine"
                            className={
                                "absolute left-[12px] right-[12px] top-[46px] h-[2px] bg-[var(--line)] opacity-0 translate-y-[-54px] transition-[transform,opacity] duration-[160ms] ease-out group-hover:translate-y-0 group-hover:opacity-95"
                            }
                        />
                    </div>

                    <div id="remoteDesktopLoader" className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2">
                        <div className="rd-loader absolute inset-0">
                            <div className="rd-loader-ring rd-loader-ring-outer" />
                            <div className="rd-loader-ring rd-loader-ring-mid" />
                            <div className="rd-loader-ring rd-loader-ring-inner" />
                            <div className="rd-loader-glow" />
                            <div className="rd-loader-label">
                                Connecting
                                <span className="rd-loader-dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            </div>
                        </div>
                        <style>{`
                     .rd-loader {
                        position: absolute;
                        inset: 0;
                        display: grid;
                        place-items: center;
                     }
                     .rd-loader-ring {
                        position: absolute;
                        border-radius: 999px;
                        border: 2px solid rgba(255,255,255,0.12);
                        box-shadow: 0 0 20px rgba(255,255,255,0.06);
                     }
                     .rd-loader-ring-outer {
                        width: 176px;
                        height: 176px;
                        border-top-color: rgba(255,64,64,0.85);
                        border-right-color: rgba(255,255,255,0.25);
                        animation: rdSpinOuter 9s linear infinite;
                     }
                     .rd-loader-ring-mid {
                        width: 124px;
                        height: 124px;
                        border-left-color: rgba(255,64,64,0.6);
                        border-bottom-color: rgba(255,255,255,0.35);
                        animation: rdSpinMid 6.5s linear infinite reverse;
                     }
                     .rd-loader-ring-inner {
                        width: 78px;
                        height: 78px;
                        border-top-color: rgba(255,255,255,0.7);
                        border-right-color: rgba(255,64,64,0.7);
                        animation: rdSpinInner 4.5s linear infinite;
                     }
                     .rd-loader-glow {
                        position: absolute;
                        width: 220px;
                        height: 220px;
                        border-radius: 999px;
                        background: radial-gradient(circle, rgba(255,64,64,0.12), rgba(0,0,0,0) 62%);
                        filter: blur(2px);
                        animation: rdGlow 2.6s ease-in-out infinite;
                     }
                     .rd-loader-label {
                        position: absolute;
                        bottom: 8px;
                        font-size: 12px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        color: rgba(255,255,255,0.78);
                        text-shadow: 0 0 18px rgba(255,255,255,0.2);
                     }
                     .rd-loader-dots span {
                        display: inline-block;
                        animation: rdDots 1.2s infinite;
                     }
                     .rd-loader-dots span:nth-child(2) { animation-delay: 0.2s; }
                     .rd-loader-dots span:nth-child(3) { animation-delay: 0.4s; }
                     @keyframes rdSpinOuter {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                     }
                     @keyframes rdSpinMid {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                     }
                     @keyframes rdSpinInner {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                     }
                     @keyframes rdGlow {
                        0%, 100% { opacity: 0.35; transform: scale(0.96); }
                        50% { opacity: 0.75; transform: scale(1.02); }
                     }
                     @keyframes rdDots {
                        0%, 100% { opacity: 0.2; }
                        50% { opacity: 1; }
                     }
                  `}</style>
                    </div>

                    <div id="remoteDesktopScreen" className="absolute inset-0 hidden overflow-hidden bg-[#111]" aria-label="Remote desktop">
                        <div id="remoteDesktopStream" className="absolute inset-0 hidden" />
                    </div>
                </div>
            </div>
        </div>
    );
}
