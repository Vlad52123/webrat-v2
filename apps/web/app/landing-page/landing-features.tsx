const FEATURES = [
    {
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        title: "Real-time monitoring",
        desc: "Track uptime, latency and errors across all your endpoints with sub-second precision.",
    },
    {
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        title: "Advanced analytics",
        desc: "Deep insights into traffic patterns, user behavior and performance bottlenecks.",
    },
    {
        icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        title: "Instant alerts",
        desc: "Get notified immediately when something goes wrong. Email, Slack and webhook integrations.",
    },
    {
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        title: "Enterprise security",
        desc: "End-to-end encryption, SOC 2 compliance, SSO and role-based access control.",
    },
    {
        icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        title: "Global CDN",
        desc: "Monitor from 30+ edge locations worldwide. See performance from your users' perspective.",
    },
    {
        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        title: "API & integrations",
        desc: "Full REST API, Grafana plugin, CI/CD hooks and dozens of third-party integrations.",
    },
];

const STEPS = [
    { step: "01", title: "Connect", desc: "Add your endpoints or install our lightweight agent. Takes under 2 minutes." },
    { step: "02", title: "Monitor", desc: "Data flows in real-time. Dashboards auto-populate with metrics and insights." },
    { step: "03", title: "Optimize", desc: "Identify bottlenecks, set alert thresholds, and improve performance." },
];

export function LandingFeatures() {
    return (
        <>
            <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
                <h2 className="mb-12 text-center text-3xl font-bold">Everything you need</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-white/10 hover:bg-white/[0.04]"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5 text-violet-400"
                                >
                                    <path d={f.icon} />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                            <p className="text-sm leading-relaxed text-white/45">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="how" className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
                <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {STEPS.map((s) => (
                        <div key={s.step} className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-400">
                                {s.step}
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                            <p className="text-sm text-white/45">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
