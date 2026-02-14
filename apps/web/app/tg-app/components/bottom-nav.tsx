"use client";

import type { ReactNode } from "react";
import { useTelegram } from "@/features/tg-app/context";

export type Tab = "home" | "shop" | "deposit" | "purchases" | "info";

const TABS: { id: Tab; label: string; icon: (active: boolean) => ReactNode }[] = [
    {
        id: "home",
        label: "Home",
        icon: (a) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
        ),
    },
    {
        id: "shop",
        label: "Shop",
        icon: (a) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" /></svg>
        ),
    },
    {
        id: "deposit",
        label: "Balance",
        icon: (a) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
        ),
    },
    {
        id: "purchases",
        label: "Orders",
        icon: (a) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" /><path d="M15 3v4a2 2 0 0 0 2 2h4" /></svg>
        ),
    },
    {
        id: "info",
        label: "Info",
        icon: (a) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        ),
    },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
    const { haptic } = useTelegram();
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center justify-around border-t border-white/[0.05] bg-[#07060b]/90 px-1 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-2xl">
            {TABS.map((t) => (
                <button
                    key={t.id}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-2 transition-colors duration-200 ${active === t.id ? "text-violet-400" : "text-white/25 active:text-white/40"
                        }`}
                    onClick={() => {
                        haptic("light");
                        onChange(t.id);
                    }}
                >
                    {t.icon(active === t.id)}
                    <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
                </button>
            ))}
        </div>
    );
}