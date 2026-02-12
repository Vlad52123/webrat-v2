"use client";

import Link from "next/link";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            {/* Gradient background */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(88, 56, 163, 0.22), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(37, 99, 235, 0.08), transparent)",
                }}
            />

            {/* Nav */}
            <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4.5 w-4.5 text-white"
                        >
                            <path d="M6 3h12l4 6-10 13L2 9z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold tracking-tight">WebCrystal</span>
                </div>
                <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
                    <a href="#features" className="transition hover:text-white">
                        Features
                    </a>
                    <a href="#how" className="transition hover:text-white">
                        How it works
                    </a>
                    <a href="#pricing" className="transition hover:text-white">
                        Pricing
                    </a>
                </nav>
                <Link
                    href="/login/"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20"
                >
                    Sign in
                </Link>
            </header>

            {/* Hero */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-24 text-center md:pt-28">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Now in public beta
                </div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                    <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                        Cloud analytics
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                        for modern teams
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/50">
                    Monitor, analyze and optimize your web infrastructure in
                    real&#8209;time. Powerful dashboards, instant alerts and deep
                    insights — all in one platform.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/login/"
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 text-sm font-semibold shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40"
                    >
                        Get started free
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                    <a
                        href="#features"
                        className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
                    >
                        Learn more
                    </a>
                </div>
            </section>

            {/* Dashboard mockup */}
            <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-1 shadow-2xl shadow-black/50">
                    <div className="rounded-xl bg-[#111118] p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/60" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                            <div className="h-3 w-3 rounded-full bg-green-500/60" />
                            <span className="ml-4 text-xs text-white/30">
                                dashboard.webcrystal.sbs
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Uptime", value: "99.98%", color: "text-emerald-400" },
                                { label: "Avg response", value: "42ms", color: "text-blue-400" },
                                { label: "Requests / min", value: "12.4k", color: "text-violet-400" },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    className="rounded-lg border border-white/5 bg-white/[0.03] p-4"
                                >
                                    <div className="text-xs text-white/40">{m.label}</div>
                                    <div className={`mt-1 text-2xl font-bold ${m.color}`}>
                                        {m.value}
                                    </div>
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

            {/* Features */}
            <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
                <h2 className="mb-12 text-center text-3xl font-bold">
                    Everything you need
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {[
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
                    ].map((f) => (
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
                            <p className="text-sm leading-relaxed text-white/45">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
                <h2 className="mb-12 text-center text-3xl font-bold">
                    How it works
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        { step: "01", title: "Connect", desc: "Add your endpoints or install our lightweight agent. Takes under 2 minutes." },
                        { step: "02", title: "Monitor", desc: "Data flows in real-time. Dashboards auto-populate with metrics and insights." },
                        { step: "03", title: "Optimize", desc: "Identify bottlenecks, set alert thresholds, and improve performance." },
                    ].map((s) => (
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

            {/* Pricing */}
            <section id="pricing" className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
                <h2 className="mb-4 text-center text-3xl font-bold">
                    Simple pricing
                </h2>
                <p className="mb-12 text-center text-white/45">
                    Start free, scale when you need to.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                        <h3 className="text-lg font-semibold">Free</h3>
                        <div className="mt-4 text-4xl font-bold">
                            $0<span className="text-base font-normal text-white/40">/mo</span>
                        </div>
                        <ul className="mt-6 space-y-3 text-sm text-white/55">
                            {["5 monitors", "5-minute checks", "Email alerts", "7-day data retention", "Community support"].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400/70">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/login/"
                            className="mt-8 block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium transition hover:bg-white/10"
                        >
                            Get started
                        </Link>
                    </div>
                    <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-8">
                        <div className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-medium">
                            Popular
                        </div>
                        <h3 className="text-lg font-semibold">Pro</h3>
                        <div className="mt-4 text-4xl font-bold">
                            $29<span className="text-base font-normal text-white/40">/mo</span>
                        </div>
                        <ul className="mt-6 space-y-3 text-sm text-white/55">
                            {["Unlimited monitors", "30-second checks", "Slack, webhook & SMS", "1-year data retention", "Priority support", "Custom dashboards", "API access"].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-400/80">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/login/"
                            className="mt-8 block rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-center text-sm font-semibold shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40"
                        >
                            Start free trial
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.06] py-10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-white/30 md:flex-row">
                    <span>&copy; {new Date().getFullYear()} WebCrystal Inc. All rights reserved.</span>
                    <div className="flex gap-6">
                        <a href="#" className="transition hover:text-white/60">Privacy</a>
                        <a href="#" className="transition hover:text-white/60">Terms</a>
                        <a href="#" className="transition hover:text-white/60">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
