"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getCookie } from "@/lib/cookie";

export function AvatarPicker() {
    const [avatarURL, setAvatarURL] = useState("/image/avatar.png");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/account/", { credentials: "include" });
                if (!res.ok || cancelled) return;
                const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
                const url = String(data?.avatar_url || "").trim();
                if (url && !cancelled) setAvatarURL(url);
            } catch {
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const onPick = useCallback(async (file: File) => {
        setUploading(true);
        try {
            const csrf = getCookie("webrat_csrf");
            const fd = new FormData();
            fd.append("avatar", file);
            const headers: Record<string, string> = csrf ? { "X-CSRF-Token": csrf } : {};
            const res = await fetch("/api/avatar", {
                method: "POST",
                credentials: "include",
                headers,
                body: fd,
            });
            if (!res.ok) {
                try { window.WebRatCommon?.showToast?.("error", "Avatar upload failed"); } catch { }
                return;
            }
            const data = (await res.json()) as { url?: string };
            const newURL = data.url || "";
            if (newURL) {
                setAvatarURL(newURL);
                try { window.WebRatCommon?.showToast?.("success", "Avatar updated"); } catch { }
            }
        } catch {
            try { window.WebRatCommon?.showToast?.("error", "Avatar upload failed"); } catch { }
        } finally {
            setUploading(false);
        }
    }, []);

    return (
        <div className="my-[10px] flex items-center gap-[14px] rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
            <div className="text-[14px] font-semibold text-white">Avatar</div>
            <div className="ml-auto flex items-center gap-[12px]">
                <div
                    className="relative h-[48px] w-[48px] shrink-0 cursor-pointer overflow-hidden rounded-full border-[2px] border-[rgba(255,255,255,0.14)] transition-[border-color,transform] duration-[160ms] hover:border-[rgba(255,255,255,0.30)] hover:scale-[1.04] active:scale-[0.97]"
                    onClick={() => !uploading && fileRef.current?.click()}
                >
                    <img
                        src={avatarURL}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                        draggable={false}
                    />
                    {uploading && (
                        <div className="absolute inset-0 grid place-items-center bg-[rgba(0,0,0,0.50)]">
                            <div className="text-[10px] font-bold text-white">...</div>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="cursor-pointer rounded-[8px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[12px] py-[6px] text-[11px] font-medium text-[rgba(255,255,255,0.55)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:text-[rgba(255,255,255,0.80)]"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                >
                    Change
                </button>
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPick(f);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
