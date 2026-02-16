import { Shimmer } from "./shimmer";

interface Profile {
    telegramId: number;
    login: string;
    registeredAt: string;
    balance: number;
    totalPaid: number;
    ordersCount: number;
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    if (h >= 17 && h < 22) return "Good evening";
    return "Good night";
}

export function HomeScreen({ profile, loading, onRefresh, username }: {
    profile: Profile | null;
    loading: boolean;
    onRefresh: () => void;
    username?: string;
}) {
    if (loading && !profile) return <Shimmer />;

    const initial = username ? username.charAt(0).toUpperCase() : "?";

    return (
        <div className="px-4 pt-4">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-medium text-white/30">{getGreeting()}</p>
                    <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-white">
                        {username || "User"}
                    </h1>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-[16px] font-extrabold text-white shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                    {initial}
                </div>
            </div>

            <button
                type="button"
                className="relative w-full overflow-hidden rounded-3xl border border-violet-500/20 bg-[#0d0a18] p-7 text-center transition-transform duration-200 active:scale-[0.98]"
                onClick={onRefresh}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.18),transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_110%,rgba(99,102,241,0.08),transparent_60%)]" />
                <div className="pointer-events-none absolute left-[15%] right-[15%] top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

                <p className="relative text-[10px] font-bold uppercase tracking-[3px] text-white/30">Balance</p>
                <p className="relative mt-3 bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-[44px] font-black leading-none tracking-tighter text-transparent">
                    {loading ? "···" : `${(profile?.balance ?? 0).toFixed(0)} ₽`}
                </p>
                <p className="relative mt-3 text-[11px] text-white/15">↻ Tap to refresh</p>
            </button>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Row icon="🔑" label="ID" value={String(profile?.telegramId ?? "—")} />
                <Row icon="👤" label="Login" value={profile?.login ?? "—"} />
                <Row icon="💵" label="Deposited" value={`${(profile?.totalPaid ?? 0).toFixed(0)} ₽`} />
                <Row icon="📦" label="Orders" value={`${profile?.ordersCount ?? 0}`} />
                <Row icon="📅" label="Registered" value={profile?.registeredAt ?? "—"} last />
            </div>
        </div>
    );
}

function Row({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
    return (
        <div className={`flex items-center justify-between px-5 py-3.5 ${last ? "" : "border-b border-white/[0.04]"}`}>
            <span className="flex items-center gap-2.5 text-[14px] text-white/40">
                <span className="text-[15px]">{icon}</span>
                {label}
            </span>
            <span className="text-[14px] font-bold tabular-nums text-white/85">{value}</span>
        </div>
    );
}
