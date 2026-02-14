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
        <div className="px-4 pt-3">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[13px] font-medium text-white/40">{getGreeting()}</p>
                    <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-white">
                        {username || "User"}
                    </h1>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[15px] font-bold text-white">
                    {initial}
                </div>
            </div>

            <button
                type="button"
                className="group w-full rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-6 text-center transition-all duration-200 active:scale-[0.98]"
                onClick={onRefresh}
            >
                <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-white/35">Balance</p>
                <p className="mt-2 bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-[40px] font-extrabold leading-none tracking-tight text-transparent">
                    {loading ? "···" : `${(profile?.balance ?? 0).toFixed(0)} ₽`}
                </p>
                <p className="mt-2 text-[11px] text-white/20">Tap to refresh</p>
            </button>

            <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1">
                <Row label="ID" value={String(profile?.telegramId ?? "—")} />
                <Row label="Login" value={profile?.login ?? "—"} />
                <Row label="Deposited" value={`${(profile?.totalPaid ?? 0).toFixed(0)} ₽`} />
                <Row label="Orders" value={`${profile?.ordersCount ?? 0}`} />
                <Row label="Registered" value={profile?.registeredAt ?? "—"} last />
            </div>
        </div>
    );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <div className={`flex items-center justify-between px-4 py-3 ${last ? "" : "border-b border-white/[0.04]"}`}>
            <span className="text-[14px] text-white/40">{label}</span>
            <span className="text-[14px] font-semibold tabular-nums text-white/90">{value}</span>
        </div>
    );
}