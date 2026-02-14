"use client";

import { useState } from "react";

interface Purchase {
    product: string;
    price: number;
    activationKey: string;
    createdAt: string;
}

export function PurchasesScreen({ purchases, loading }: { purchases: Purchase[]; loading: boolean }) {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const copyKey = (key: string, idx: number) => {
        navigator.clipboard?.writeText(key).catch(() => { });
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    };

    if (loading) {
        return (
            <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
                <p className="text-[13px] text-white/20">Loading...</p>
            </div>
        );
    }

    if (purchases.length === 0) {
        return (
            <div className="flex min-h-[50dvh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-3 text-[48px]">📭</div>
                <p className="text-[15px] font-semibold text-white/30">No orders yet</p>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-3.5 text-[12px] font-bold uppercase tracking-[2px] text-white/30">Orders</h2>
            <div className="flex flex-col gap-2.5">
                {purchases.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                        <p className="text-[15px] font-bold text-white/90">{p.product}</p>
                        <div className="mt-2 flex items-center justify-between text-[12px] text-white/30">
                            <span>{p.price.toFixed(0)} ₽</span>
                            <span>{p.createdAt}</span>
                        </div>
                        {p.activationKey && (
                            <button
                                type="button"
                                onClick={() => copyKey(p.activationKey, i)}
                                className="relative mt-3 w-full break-all rounded-xl border border-violet-500/10 bg-violet-500/[0.06] px-3 py-2.5 text-left font-mono text-[13px] text-violet-300 transition-all duration-150 active:scale-[0.98]"
                            >
                                {copiedIdx === i ? (
                                    <span className="font-sans font-semibold text-violet-400">Copied!</span>
                                ) : (
                                    p.activationKey
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}