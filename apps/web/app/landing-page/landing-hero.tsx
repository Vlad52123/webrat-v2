import Link from "next/link";

export function LandingHero() {
    return (
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
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
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
    );
}
