export function ShopScreen({ balance, onBuy, buying }: {
    balance: number;
    onBuy: (plan: "month" | "year" | "forever") => void;
    buying: boolean;
}) {
    const plans: { plan: "month" | "year" | "forever"; icon: string; title: string; desc: string; price: number; popular?: boolean }[] = [
        { plan: "month", icon: "⏱", title: "1 Month", desc: "30 days access", price: 299 },
        { plan: "year", icon: "⭐", title: "1 Year", desc: "365 days access", price: 599, popular: true },
        { plan: "forever", icon: "♾️", title: "Forever", desc: "Lifetime access", price: 1299 },
    ];

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[2.5px] text-white/30">WebCrystal</h2>
            <div className="flex flex-col gap-3">
                {plans.map((p) => (
                    <button
                        key={p.plan}
                        type="button"
                        disabled={buying}
                        onClick={() => onBuy(p.plan)}
                        className={`relative flex items-center justify-between overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.97] disabled:opacity-30 ${p.popular
                            ? "border-violet-500/25 bg-[#0d0a18] shadow-[0_4px_24px_rgba(124,58,237,0.08)]"
                            : "border-white/[0.07] bg-white/[0.03]"
                            }`}
                    >
                        {p.popular && (
                            <>
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(124,58,237,0.12),transparent_70%)]" />
                                <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                            </>
                        )}
                        <div className="relative flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[20px]">
                                {p.icon}
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[16px] font-bold text-white">{p.title}</span>
                                    {p.popular && (
                                        <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-violet-300 shadow-[0_0_12px_rgba(124,58,237,0.2)]">
                                            Best
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-[12px] text-white/30">{p.desc}</p>
                            </div>
                        </div>
                        <span className="relative text-[20px] font-extrabold text-violet-400 drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]">
                            {p.price} ₽
                        </span>
                    </button>
                ))}
            </div>
            <div className="mt-5 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/[0.08] px-4 py-2 text-[13px] font-bold text-violet-300">
                    💰 Balance: {balance.toFixed(0)} ₽
                </span>
            </div>
        </div>
    );
}