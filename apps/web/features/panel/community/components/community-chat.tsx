"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useChat, useChatPermissions } from "../hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatProfilePopup } from "./chat-profile-popup";

export function CommunityChat() {
    const { messages, loading, sendMessage, uploadImage } = useChat();
    const perm = useChatPermissions();

    const [text, setText] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [sending, setSending] = useState(false);
    const [profileLogin, setProfileLogin] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const prevCountRef = useRef(0);

    useEffect(() => {
        if (messages.length > prevCountRef.current) {
            const el = scrollRef.current;
            if (el) {
                requestAnimationFrame(() => {
                    el.scrollTop = el.scrollHeight;
                });
            }
        }
        prevCountRef.current = messages.length;
    }, [messages.length]);

    const onSend = useCallback(async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        const wordCount = trimmed.split(/\s+/).length;
        if (wordCount > 255) {
            try { window.WebRatCommon?.showToast?.("warning", "Maximum 255 words per message"); } catch { }
            return;
        }

        setSending(true);
        try {
            await sendMessage(trimmed, imageURL);
            setText("");
            setImageURL("");
            setImagePreview("");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Send failed";
            if (msg === "email_required") {
                try { window.WebRatCommon?.showToast?.("warning", "Connect your email to write in chat"); } catch { }
            } else if (msg === "message_too_long") {
                try { window.WebRatCommon?.showToast?.("warning", "Maximum 255 words per message"); } catch { }
            } else {
                try { window.WebRatCommon?.showToast?.("error", msg); } catch { }
            }
        } finally {
            setSending(false);
        }
    }, [text, imageURL, sending, sendMessage]);

    const onImagePick = useCallback(async (file: File) => {
        try {
            const url = await uploadImage(file);
            setImageURL(url);
            setImagePreview(URL.createObjectURL(file));
        } catch {
            try { window.WebRatCommon?.showToast?.("error", "Image upload failed"); } catch { }
        }
    }, [uploadImage]);

    const placeholderText = (() => {
        if (perm.reason === "loading") return "Loading...";
        if (perm.reason === "no_email") return "Connect your email so you can write";
        if (perm.reason === "no_subscription") return "Buy RATER subscription to start chatting";
        return "Write a message";
    })();

    const inputDisabled = !perm.canWrite || sending;

    return (
        <div className="flex h-[calc(100vh-220px)] max-h-[600px] min-h-[320px] flex-col rounded-[16px] border border-[rgba(255,255,255,0.10)] bg-[rgba(22,22,26,0.60)] backdrop-blur-[10px]">
            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto px-[16px] py-[14px]"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.12) transparent" }}
            >
                {loading && (
                    <div className="grid place-items-center py-[40px]">
                        <div className="text-[13px] text-[rgba(255,255,255,0.35)]">Loading chat...</div>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="grid place-items-center py-[40px]">
                        <div className="text-[13px] text-[rgba(255,255,255,0.30)]">No messages yet. Be the first to write!</div>
                    </div>
                )}

                <div className="flex flex-col gap-[8px]">
                    {messages.map((m) => (
                        <ChatMessage key={m.id} msg={m} onAvatarClick={setProfileLogin} />
                    ))}
                </div>
            </div>

            {imagePreview && (
                <div className="flex items-center gap-[8px] border-t border-[rgba(255,255,255,0.06)] px-[16px] py-[8px]">
                    <img src={imagePreview} alt="" className="h-[40px] w-[40px] rounded-[8px] border border-[rgba(255,255,255,0.10)] object-cover" draggable={false} />
                    <button
                        type="button"
                        className="cursor-pointer border-none bg-transparent text-[11px] text-[rgba(255,75,75,0.80)] hover:text-[rgba(255,75,75,1)] p-0 transition-colors duration-[140ms]"
                        onClick={() => { setImageURL(""); setImagePreview(""); }}
                    >
                        Remove
                    </button>
                </div>
            )}

            <div className="flex items-center gap-[10px] border-t border-[rgba(255,255,255,0.08)] px-[14px] py-[12px]">
                <input
                    type="text"
                    className="min-w-0 flex-1 rounded-[12px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[10px] text-[13px] text-white placeholder-[rgba(255,255,255,0.28)] outline-none transition-[border-color,background] duration-[140ms] focus:border-[rgba(255,255,255,0.20)] focus:bg-[rgba(255,255,255,0.06)] disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={placeholderText}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={inputDisabled}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void onSend();
                        }
                    }}
                    maxLength={5000}
                />

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onImagePick(f);
                        e.target.value = "";
                    }}
                />

                <button
                    type="button"
                    className="grid h-[38px] w-[38px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[16px] text-[rgba(255,255,255,0.50)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:text-[rgba(255,255,255,0.70)] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={inputDisabled}
                    title="Attach image"
                    onClick={() => fileRef.current?.click()}
                >
                    📎
                </button>

                <button
                    type="button"
                    className="h-[38px] shrink-0 cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-[18px] text-[13px] font-semibold text-[rgba(255,255,255,0.80)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.22)] hover:text-white active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={inputDisabled || !text.trim()}
                    onClick={() => void onSend()}
                >
                    Send
                </button>
            </div>

            <ChatProfilePopup login={profileLogin} onClose={() => setProfileLogin(null)} />
        </div>
    );
}
