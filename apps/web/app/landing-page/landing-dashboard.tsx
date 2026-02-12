export function LandingDashboard() {
    return (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1 shadow-2xl shadow-black/50">
                <div className="rounded-xl bg-[#111118] p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/60" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                        <div className="h-3 w-3 rounded-full bg-green-500/60" />
                        <span className="ml-4 text-xs text-white/30">dashboard.webcrystal.sbs</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {([
                            { label: "Uptime", value: "99.98%", color: "text-emerald-400" },
                            { label: "Avg response", value: "42ms", color: "text-blue-400" },
                            { label: "Requests / min", value: "12.4k", color: "text-violet-400" },
                        ] as const).map((m) => (
                            <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
                                <div className="text-xs text-white/40">{m.label}</div>
                                <div className={`mt-1 text-2xl font-bold ${m.color}`}>{m.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex h-32 items-end gap-1">
                        {Array.from({ length: 40 }).map((_, i) => {
                            const h = 20 + Math.sin(i * 0.4) * 30 + Math.random() * 25;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t bg-gradient-to-t from-violet-600/40 to-violet-400/20"
                                    style={{ height: `${h}%` }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
