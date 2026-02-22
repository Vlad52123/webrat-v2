"use client";

import { useEffect, useState } from "react";

import { getCookie } from "@/lib/cookie";

type ProfileData = {
    login: string;
    avatar_url: string;
    created_at: string;
    subscription_status: string;
};

function formatJoined(iso: string): string {
    try {
        const d = new Date(iso);
        if (!Number.isFinite(d.getTime())) return "Unknown";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
    } catch {
        return "Unknown";
    }
}

export function ChatProfilePopup(props: { login: string | null; onClose: () => void }) {
    const { login, onClose } = props;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!login) {
            setProfile(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const csrf = getCookie("webrat_csrf");
                const headers: Record<string, string> = csrf ? { "X-CSRF-Token": csrf } : {};
                const res = await fetch(`/api/user-profile?login=${encodeURIComponent(login)}`, {
                    credentials: "include",
                    headers,
                });
                if (!res.ok || cancelled) return;
                const data = (await res.json()) as ProfileData;
                if (!cancelled) setProfile(data);
            } catch {
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [login]);

    if (!login) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] grid place-items-center bg-[rgba(0,0,0,0.60)] backdrop-blur-[8px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-[300px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.16)] bg-[rgba(18,18,22,0.94)] shadow-[0_28px_64px_rgba(0,0,0,0.7)] backdrop-blur-[12px]">
                <button
                    type="button"
                    className="absolute right-[10px] top-[10px] z-10 grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[16px] leading-none text-[rgba(255,255,255,0.80)] transition-[background,border-color] duration-[140ms] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.24)]"
                    aria-label="Close"
                    onClick={onClose}
                >
                    ×
                </button>

                {loading && (
                    <div className="grid place-items-center py-[40px]">
                        <div className="text-[13px] text-[rgba(255,255,255,0.40)]">Loading...</div>
                    </div>
                )}

                {!loading && profile && (
                    <div className="grid place-items-center gap-[14px] px-[24px] py-[28px]">
                        <div className="text-[10px] font-bold uppercase tracking-[1.4px] text-[rgba(255,255,255,0.40)]">Profile</div>
                        <img
                            src={profile.avatar_url || "/image/avatar.png"}
                            alt=""
                            draggable={false}
                            className="h-[72px] w-[72px] rounded-full border-[2px] border-[rgba(255,255,255,0.14)] object-cover"
                        />
                        <div className="text-[16px] font-extrabold text-white">{profile.login}</div>
                        <div className="grid gap-[6px] text-center">
                            <div className="text-[11px] text-[rgba(255,255,255,0.40)]">
                                Joined: <span className="text-[rgba(255,255,255,0.65)]">{formatJoined(profile.created_at)}</span>
                            </div>
                            <div className="text-[11px] text-[rgba(255,255,255,0.40)]">
                                Subscribe:{" "}
                                <span
                                    className="font-bold"
                                    style={{
                                        color: (profile.subscription_status || "").toLowerCase() === "vip"
                                            ? "rgb(78,233,122)"
                                            : "rgba(255,255,255,0.50)",
                                    }}
                                >
                                    {(profile.subscription_status || "").toLowerCase() === "vip" ? "RATER" : "NONE"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !profile && (
                    <div className="grid place-items-center py-[40px]">
                        <div className="text-[13px] text-[rgba(255,255,255,0.40)]">User not found</div>
                    </div>
                )}
            </div>
        </div>
    );
}
