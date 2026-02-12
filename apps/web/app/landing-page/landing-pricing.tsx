import Link from "next/link";

const FREE_FEATURES = ["5 monitors", "5-minute checks", "Email alerts", "7-day data retention", "Community support"];
const PRO_FEATURES = ["Unlimited monitors", "30-second checks", "Slack, webhook & SMS", "1-year data retention", "Priority support", "Custom dashboards", "API access"];

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
    );
}

export function LandingPricing() {
    return (
        <section id="pricing" className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
            <h2 className="mb-4 text-center text-3xl font-bold">Simple pricing</h2>
            <p className="mb-12 text-center text-white/45">Start free, scale when you need to.</p>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                    <h3 className="text-lg font-semibold">Free</h3>
                    <div className="mt-4 text-4xl font-bold">$0<span className="text-base font-normal text-white/40">/mo</span></div>
                    <ul className="mt-6 space-y-3 text-sm text-white/55">
                        {FREE_FEATURES.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-emerald-400/70" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/login/" className="mt-8 block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium transition hover:bg-white/10">
                        Get started
                    </Link>
                </div>
                <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-8">
                    <div className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-medium">Popular</div>
                    <h3 className="text-lg font-semibold">Pro</h3>
                    <div className="mt-4 text-4xl font-bold">$29<span className="text-base font-normal text-white/40">/mo</span></div>
                    <ul className="mt-6 space-y-3 text-sm text-white/55">
                        {PRO_FEATURES.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-violet-400/80" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/login/" className="mt-8 block rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-center text-sm font-semibold shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40">
                        Start free trial
                    </Link>
                </div>
            </div>
        </section>
    );
}
