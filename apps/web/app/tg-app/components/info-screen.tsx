"use client";

import { useTelegram } from "@/features/tg-app/context";

export function InfoScreen() {
    const { openLink } = useTelegram();

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[2.5px] text-white/30">Information</h2>

            <button
                type="button"
                onClick={() => openLink("https://webcrystal.sbs/")}
                className="mb-3 flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all duration-200 active:scale-[0.97]"
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-[22px]">🌐</span>
                <div>
                    <p className="text-[15px] font-bold text-white">Website</p>
                    <p className="mt-0.5 text-[12px] text-white/25">webcrystal.sbs</p>
                </div>
            </button>

            <button
                type="button"
                onClick={() => openLink("https://t.me/WebCrystalbot")}
                className="mb-3 flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all duration-200 active:scale-[0.97]"
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-[22px]">🤖</span>
                <div>
                    <p className="text-[15px] font-bold text-white">Bot</p>
                    <p className="mt-0.5 text-[12px] text-white/25">@WebCrystalbot</p>
                </div>
            </button>

            <div className="mt-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-2">
                <Feature icon="✅" text="Works in browser — no launchers needed" />
                <Feature icon="✅" text="No hosting or open ports required" />
                <Feature icon="✅" text="Built with Go — no Java or .NET" />
                <Feature icon="💡" text="VPN may be required in some regions" dim />
            </div>
        </div>
    );
}

function Feature({ icon, text, dim }: { icon: string; text: string; dim?: boolean }) {
    return (
        <div className="flex items-start gap-3 border-b border-white/[0.03] py-3 last:border-0">
            <span className="mt-0.5 text-[14px]">{icon}</span>
            <span className={`text-[13px] leading-relaxed ${dim ? "italic text-white/15" : "text-white/40"}`}>{text}</span>
        </div>
    );
}
