"use client";

import { useState } from "react";

export function DepositScreen({ onDeposit, depositing }: {
    onDeposit: (amount: number) => void;
    depositing: boolean;
}) {
    const [amount, setAmount] = useState("");
    const presets = [100, 300, 500, 1000, 2000, 5000];
    const numAmount = parseInt(amount) || 0;

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-3.5 text-[12px] font-bold uppercase tracking-[2px] text-white/30">Deposit</h2>

            <div className="mb-3 grid grid-cols-3 gap-2">
                {presets.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(String(p))}
                        className={`rounded-xl border py-3 text-center text-[15px] font-semibold transition-all duration-150 active:scale-[0.93] ${numAmount === p
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                            : "border-white/[0.06] bg-white/[0.025] text-white/70"
                            }`}
                    >
                        {p} ₽
                    </button>
                ))}
            </div>

            <input
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-center text-[20px] font-bold text-white outline-none placeholder:text-white/20 focus:border-violet-500/30"
                type="number"
                inputMode="numeric"
                placeholder="Amount (₽)"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                min="50"
                max="1000000"
            />

            <p className="mt-2 text-center text-[12px] text-white/20">50 — 1 000 000 ₽</p>

            <button
                type="button"
                disabled={depositing || numAmount < 50 || numAmount > 1000000}
                onClick={() => onDeposit(numAmount)}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-[16px] font-bold text-white shadow-[0_8px_30px_rgba(124,58,237,0.25)] transition-all duration-200 active:scale-[0.96] disabled:opacity-30 disabled:shadow-none"
            >
                {depositing ? "Creating..." : `Deposit${numAmount > 0 ? ` ${numAmount} ₽` : ""}`}
            </button>
        </div>
    );
}