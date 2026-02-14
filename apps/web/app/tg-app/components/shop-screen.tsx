export function ShopScreen({ balance, onBuy, buying }: {
    balance: number;
    onBuy: (plan: "month" | "year" | "forever") => void;
    buying: boolean;
}) {
    const plans: { plan: "month" | "year" | "forever"; title: string; desc: string; price: number; popular?: boolean }[] = [
        { plan: "month", title: "1 Month", desc: "30 days access", price: 299 },
        { plan: "year", title: "1 Year", desc: "365 days access", price: 599, popular: true },
        { plan: "forever", title: "Forever", desc: "Lifetime access", price: 1299 },
    ];

    return (
        <div className="px-4 pt-4">
            <h2 className="mb-3.5 text-[12px] font-bold uppercase tracking-[2px] text-white/30">WebCrystal</h2>
            <div className="flex flex-col gap-2.5">
                {plans.map((p) => (
                    <button
                        key={p.plan}
                        type="button"
                        disabled={buying}
                        onClick={() => onBuy(p.plan)}
                        className={`relative flex items-center justify-between rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.97] disabled:opacity-40 ${p.popular
                            ? "border-violet-500/20 bg-gradient-to-r from-violet-500/[0.07] to-indigo-500/[0.03]"
                            : "border-white/[0.06] bg-white/[0.025]"
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[16px] font-bold text-white">{p.title}</span>
                                {p.popular && (
                                    <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                                        Best value
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-[12px] text-white/35">{p.desc}</p>
                        </div>
                        <span className="text-[20px] font-extrabold text-violet-400">{p.price} ₽</span>
                    </button>
                ))}
            </div>
            <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/15 bg-violet-500/[0.07] px-3 py-1.5 text-[13px] font-semibold text-violet-300">
                    Balance: {balance.toFixed(0)} ₽
                </span>
            </div>
        </div>
    );
}