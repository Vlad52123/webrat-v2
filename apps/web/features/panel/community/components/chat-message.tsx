"use client";

import { memo, useState } from "react";

import type { ChatMsg } from "../hooks/use-chat";

function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        if (!Number.isFinite(d.getTime())) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
        return "";
    }
}

const MAX_PREVIEW_LENGTH = 300;

export const ChatMessage = memo(function ChatMessage(props: {
    msg: ChatMsg;
    onAvatarClick: (login: string) => void;
}) {
    const { msg, onAvatarClick } = props;
    const [expanded, setExpanded] = useState(false);

    const isLong = msg.message.length > MAX_PREVIEW_LENGTH;
    const displayText = isLong && !expanded ? msg.message.slice(0, MAX_PREVIEW_LENGTH) + "..." : msg.message;
    const avatarSrc = msg.avatar_url || "/image/avatar.png";

    return (
        <div className="flex gap-[12px] rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-[14px] py-[12px] transition-all duration-[160ms] hover:bg-[rgba(255,255,255,0.05)]">
            <img
                src={avatarSrc}
                alt=""
                draggable={false}
                className="h-[38px] w-[38px] shrink-0 cursor-pointer select-none rounded-full border border-[rgba(255,255,255,0.12)] object-cover transition-[border-color,transform] duration-[140ms] hover:border-[rgba(255,255,255,0.30)] hover:scale-[1.05]"
                onClick={() => onAvatarClick(msg.login)}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[8px] flex-wrap">
                    <span className="text-[13px] font-bold text-[rgba(255,255,255,0.90)]">{msg.login}</span>
                    <span className="text-[10px] text-[rgba(255,255,255,0.28)]">{formatDate(msg.created_at)}</span>
                </div>
                <div className="mt-[4px] text-[13px] leading-[1.45] text-[rgba(255,255,255,0.72)] break-words whitespace-pre-wrap">
                    {displayText}
                </div>
                {isLong && (
                    <button
                        type="button"
                        className="mt-[6px] cursor-pointer border-none bg-transparent text-[11px] font-semibold text-[rgba(100,180,255,0.80)] transition-colors duration-[140ms] hover:text-[rgba(100,180,255,1)] p-0"
                        onClick={() => setExpanded((v) => !v)}
                    >
                        {expanded ? "Collapse" : "Expand Message"}
                    </button>
                )}
                {msg.image_url && (
                    <img
                        src={msg.image_url}
                        alt=""
                        className="mt-[8px] max-w-[280px] max-h-[200px] rounded-[10px] border border-[rgba(255,255,255,0.08)] object-cover"
                        draggable={false}
                    />
                )}
            </div>
        </div>
    );
});
