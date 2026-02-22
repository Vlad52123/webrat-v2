"use client";

import { memo } from "react";

import type { CommunityItem } from "../types";
import { CommunityItemDetails } from "./community-item-details";

const keyAccents: Record<string, { border: string; glow: string; iconBg: string; iconBorder: string }> = {
    information: {
        border: "rgba(100,180,255,0.28)",
        glow: "rgba(100,180,255,0.08)",
        iconBg: "rgba(100,180,255,0.10)",
        iconBorder: "rgba(100,180,255,0.22)",
    },
    rules: {
        border: "rgba(245,210,60,0.28)",
        glow: "rgba(245,210,60,0.08)",
        iconBg: "rgba(245,210,60,0.10)",
        iconBorder: "rgba(245,210,60,0.22)",
    },
    updates: {
        border: "rgba(78,233,122,0.28)",
        glow: "rgba(78,233,122,0.08)",
        iconBg: "rgba(78,233,122,0.10)",
        iconBorder: "rgba(78,233,122,0.22)",
    },
};

const defaultAccent = {
    border: "rgba(255,255,255,0.14)",
    glow: "rgba(255,255,255,0.04)",
    iconBg: "rgba(255,255,255,0.06)",
    iconBorder: "rgba(255,255,255,0.12)",
};

const keyIcons: Record<string, string | null> = {
    information: "/icons/information.svg",
    rules: "/icons/rules.svg",
    updates: "/icons/updates.svg",
};

export const CommunityItemCard = memo(function CommunityItemCard(props: {
    item: CommunityItem;
    isOpen: boolean;
    messageCount: number;
    onToggle: (key: string) => void;
}) {
    const { item, isOpen, messageCount, onToggle } = props;

    const accent = keyAccents[item.key] || defaultAccent;
    const iconSrc = keyIcons[item.key];

    const iconContent = iconSrc ? (
        <img src={iconSrc} alt="" draggable={false} className="h-[24px] w-[24px] select-none pointer-events-none opacity-80 invert" />
    ) : (
        <span className="text-[20px]">ℹ</span>
    );

    return (
        <div
            className="group cursor-pointer rounded-[16px] border transition-all duration-[220ms] ease-out backdrop-blur-[12px]"
            style={{
                borderColor: isOpen ? accent.border : "rgba(255,255,255,0.08)",
                background: isOpen
                    ? `linear-gradient(135deg, ${accent.glow} 0%, rgba(22,22,26,0.82) 100%)`
                    : "rgba(22,22,26,0.55)",
                boxShadow: isOpen
                    ? `0 20px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset, 0 0 24px ${accent.glow}`
                    : "0 8px 24px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
                if (!isOpen) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = accent.border;
                    (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(135deg, ${accent.glow} 0%, rgba(22,22,26,0.70) 100%)`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 14px 36px rgba(0,0,0,0.4), 0 0 16px ${accent.glow}`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isOpen) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(22,22,26,0.55)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
                }
            }}
            onClick={() => onToggle(item.key)}
        >
            <div className="flex items-center gap-[16px] px-[22px] py-[18px]">
                <div
                    className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[12px] border text-[22px] transition-all duration-[220ms]"
                    style={{
                        background: accent.iconBg,
                        borderColor: accent.iconBorder,
                    }}
                >
                    {iconContent}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-[12px]">
                        <div className="min-w-0">
                            <div className="text-[15px] font-extrabold tracking-[0.3px] text-[rgba(255,255,255,0.94)]">
                                {item.title}
                            </div>
                            <div className="mt-[3px] text-[11px] font-medium text-[rgba(255,255,255,0.38)]">
                                {item.author}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-[14px]">
                            <span className="text-[11px] font-medium text-[rgba(255,255,255,0.30)]">{item.date}</span>
                            <span
                                className="grid h-[24px] min-w-[24px] place-items-center rounded-[8px] px-[7px] text-[11px] font-bold transition-all duration-[220ms]"
                                style={{
                                    background: accent.iconBg,
                                    color: "rgba(255,255,255,0.60)",
                                    border: `1px solid ${accent.iconBorder}`,
                                }}
                            >
                                {messageCount}
                            </span>
                            <span
                                className="text-[10px] text-[rgba(255,255,255,0.40)] transition-transform duration-[220ms]"
                                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            >
                                ▼
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t px-[22px] pb-[18px]" style={{ borderColor: `${accent.border}` }}>
                    <CommunityItemDetails item={item} />
                </div>
            )}
        </div>
    );
});
