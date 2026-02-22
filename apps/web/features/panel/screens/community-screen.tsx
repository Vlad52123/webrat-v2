"use client";

import { useCallback, useState } from "react";

import { communityItems, communityMessageCounts } from "../community/data";
import { CommunityItemCard } from "../community/components/community-item-card";
import { CommunityChat } from "../community/components/community-chat";

type CommunityTab = "posts" | "chat";

export function CommunityScreen() {
    const [tab, setTab] = useState<CommunityTab>("posts");
    const [openKey, setOpenKey] = useState<string | null>(null);

    const onToggle = useCallback((key: string) => {
        setOpenKey((prev) => (prev === key ? null : key));
    }, []);

    return (
        <div id="communityView" className="h-full overflow-auto">
            <div className="mx-auto w-full max-w-[min(900px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[28px]">
                <div className="mb-[20px] text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.55)]" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>Community</div>
                </div>

                <div className="mb-[18px] flex items-center justify-center gap-[6px]">
                    <button
                        type="button"
                        className={
                            "cursor-pointer rounded-[10px] border px-[20px] py-[7px] text-[12px] font-semibold transition-all duration-[160ms] " +
                            (tab === "posts"
                                ? "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white"
                                : "border-[rgba(255,255,255,0.06)] bg-transparent text-[rgba(255,255,255,0.40)] hover:border-[rgba(255,255,255,0.12)] hover:text-[rgba(255,255,255,0.60)]")
                        }
                        onClick={() => setTab("posts")}
                    >
                        Posts
                    </button>
                    <button
                        type="button"
                        className={
                            "cursor-pointer rounded-[10px] border px-[20px] py-[7px] text-[12px] font-semibold transition-all duration-[160ms] " +
                            (tab === "chat"
                                ? "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white"
                                : "border-[rgba(255,255,255,0.06)] bg-transparent text-[rgba(255,255,255,0.40)] hover:border-[rgba(255,255,255,0.12)] hover:text-[rgba(255,255,255,0.60)]")
                        }
                        onClick={() => setTab("chat")}
                    >
                        Chat
                    </button>
                </div>

                {tab === "posts" && (
                    <div className="flex flex-col gap-[10px]">
                        {communityItems.map((it) => (
                            <CommunityItemCard
                                key={it.key}
                                item={it}
                                isOpen={openKey === it.key}
                                messageCount={communityMessageCounts.get(it.key) ?? 0}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                )}

                {tab === "chat" && <CommunityChat />}
            </div>
        </div>
    );
}
