"use client";

import { useState } from "react";

export function SuccessScreen({ product, activationKey, onDone }: {
    product: string;
    activationKey: string;
    onDone: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const copyKey = () => {
        navigator.clipboard?.writeText(activationKey).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-[80dvh] flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 text-[64px]">🎉</div>
            <h2 className="text-[24px] font-extrabold text-white">Payment successful</h2>
            <p className="mt-1 text-[14px] text-white/40">{product}</p>
            <button
                type="button"
                onClick={copyKey}
                className="relative my-6 w-full break-all rounded-xl border border-violet-500/15 bg-violet-500/[0.07] px-4 py-3.5 font-mono text-[16px] text-violet-300 transition-all duration-150 active:scale-[0.98]"
            >
                {copied ? <span className="font-sans font-bold text-violet-400">Copied!</span> : activationKey}
            </button>
            <p className="mb-6 text-[12px] text-white/20">Tap the key to copy</p>
            <button
                type="button"
                onClick={onDone}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-[16px] font-bold text-white shadow-[0_8px_30px_rgba(124,58,237,0.25)] transition-all duration-200 active:scale-[0.96]"
            >
                Done
            </button>
        </div>
    );
}