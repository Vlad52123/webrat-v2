"use client";

import { useTelegram } from "@/features/tg-app/context";

export function InfoScreen() {
    const { openLink } = useTelegram();

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-3.5 text-[12px] font-bold uppercase tracking-[2px] text-white/30">Information</h2>

            <button
                type="button"
                onClick={() => openLink("https://webcrystal.sbs/")}
                className="mb-2.5 flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left transition-all duration-200 active:scale-[0.97]"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-[20px]">🌐</span>
                <div>
                    <p className="text-[15px] font-bold text-white/90">Website</p>
                    <p className="mt-0.5 text-[12px] text-white/30">webcrystal.sbs</p>
                </div>
            </button>

            <button
                type="button"
                onClick={() => openLink("https://t.me/WebCrystalbot")}
                className="mb-2.5 flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left transition-all duration-200 active:scale-[0.97]"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-[20px]">🤖</span>
                <div>
                    <p className="text-[15px] font-bold text-white/90">Bot</p>
                    <p className="mt-0.5 text-[12px] text-white/30">@WebCrystalbot</p>
                </div>
            </button>

            <div className="mt-1 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <Feature text="Works in browser — no launchers needed" />
                <Feature text="No hosting or open ports required" />
                <Feature text="Built with Go — no Java or .NET" />
                <Feature text="VPN may be required in some regions" dim />
            </div>
        </div>
    );
}

function Feature({ text, dim }: { text: string; dim?: boolean }) {
    return (
        <div className="flex items-start gap-2.5 border-b border-white/[0.03] py-2.5 last:border-0">
            <span className="mt-0.5 text-[14px]">{dim ? "💡" : "✓"}</span>
            <span className={`text-[13px] leading-relaxed ${dim ? "italic text-white/20" : "text-white/40"}`}>{text}</span>
        </div>
    );
}