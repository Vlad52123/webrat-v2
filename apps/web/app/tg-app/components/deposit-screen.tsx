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
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[2.5px] text-white/30">Deposit</h2>

            <div className="mb-4 grid grid-cols-3 gap-2">
                {presets.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(String(p))}
                        className={`rounded-xl border py-3.5 text-center text-[15px] font-bold transition-all duration-150 active:scale-[0.93] ${numAmount === p
                            ? "border-violet-500/35 bg-violet-500/12 text-violet-300 shadow-[0_0_16px_rgba(124,58,237,0.12)]"
                            : "border-white/[0.07] bg-white/[0.03] text-white/60"
                            }`}
                    >
                        {p} ₽
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <input
                    className="w-full bg-transparent px-5 py-4 text-center text-[22px] font-extrabold text-white outline-none placeholder:text-white/15"
                    type="number"
                    inputMode="numeric"
                    placeholder="Amount (₽)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    min="50"
                    max="1000000"
                />
            </div>

            <p className="mt-2.5 text-center text-[12px] text-white/15">50 — 1 000 000 ₽</p>

            <button
                type="button"
                disabled={depositing || numAmount < 50 || numAmount > 1000000}
                onClick={() => onDeposit(numAmount)}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-[16px] font-extrabold text-white shadow-[0_8px_32px_rgba(124,58,237,0.3)] transition-all duration-200 active:scale-[0.96] disabled:opacity-25 disabled:shadow-none"
            >
                {depositing ? "Creating..." : `Deposit${numAmount > 0 ? ` ${numAmount} ₽` : ""}`}
            </button>
        </div>
    );
}
