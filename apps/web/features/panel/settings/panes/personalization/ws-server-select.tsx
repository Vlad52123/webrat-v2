"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";
import { createPortal } from "react-dom";

import { WS_OPTIONS } from "./ws-options";
import { useSubscriptionQuery } from "../../../hooks/use-subscription-query";
import { showToast } from "../../../toast";

interface Props {
    setWsHost: (host: string) => void;
    wsSelectValue: string;
    wsWrapRef: RefObject<HTMLDivElement | null>;
    wsBtnRef: RefObject<HTMLButtonElement | null>;
    wsMenuRef: RefObject<HTMLDivElement | null>;
    wsOpen: boolean;
    setWsOpen: Dispatch<SetStateAction<boolean>>;
    wsMenuPos: { left: number; top: number; width: number } | null;
}

const PREMIUM_VALUES = new Set(["ru.webcrystal.sbs", "kz.webcrystal.sbs", "ua.webcrystal.sbs"]);

export function WsServerSelect({
    setWsHost,
    wsSelectValue,
    wsWrapRef,
    wsBtnRef,
    wsMenuRef,
    wsOpen,
    setWsOpen,
    wsMenuPos,
}: Props) {
    const subQ = useSubscriptionQuery();
    const isVip = String(subQ.data?.status || "").toLowerCase() === "vip";

    return (
        <div ref={wsWrapRef}>
            <button
                ref={wsBtnRef}
                type="button"
                className={
                    "flex h-[32px] items-center gap-[6px] rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-[10px] text-[13px] font-semibold text-white/80 transition-all cursor-pointer " +
                    "hover:bg-white/[0.07] hover:border-white/[0.18] hover:text-white"
                }
                onClick={() => {
                    const willOpen = !wsOpen;
                    setWsOpen(willOpen);
                    if (!willOpen) return;
                    const btn = wsBtnRef.current;
                    if (!btn) return;
                }}
            >
                {WS_OPTIONS.find((o) => o.value === wsSelectValue)?.label || "Default"}
                <span className="text-[10px] opacity-50">▼</span>
            </button>

            {wsOpen && wsMenuPos
                ? createPortal(
                    <div
                        ref={wsMenuRef}
                        className="fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
                        style={{ left: wsMenuPos.left, top: wsMenuPos.top, minWidth: wsMenuPos.width }}
                        role="listbox"
                    >
                        {WS_OPTIONS.map((opt) => {
                            const selected = wsSelectValue === opt.value;
                            const locked = PREMIUM_VALUES.has(opt.value) && !isVip;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "w-full text-left px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold transition-[background,border-color] cursor-pointer border " +
                                        (selected
                                            ? "bg-white/[0.07] border-white/[0.16] text-white"
                                            : locked
                                                ? "bg-transparent border-transparent text-white/30 hover:bg-white/[0.02]"
                                                : "bg-transparent border-transparent text-white/90 hover:bg-white/[0.045] hover:border-white/[0.10]")
                                    }
                                    onClick={() => {
                                        if (locked) {
                                            showToast("error", "Premium subscription required");
                                            return;
                                        }
                                        setWsHost(opt.value === "__default__" ? "" : opt.value);
                                        setWsOpen(false);
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                >
                                    {opt.label}
                                    {locked && <span className="ml-[6px] text-[10px] opacity-40">🔒</span>}
                                </button>
                            );
                        })}
                    </div>,
                    document.body,
                )
                : null}
        </div>
    );
}
