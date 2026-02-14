export function Shimmer() {
    return (
        <div className="px-4 pt-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
                <div className="mx-auto mb-2 h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                <div className="mx-auto mb-2 h-10 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="mx-auto h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
            </div>
            <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/[0.04] py-3 last:border-0">
                        <div className="h-3.5 w-24 animate-pulse rounded bg-white/[0.06]" />
                        <div className="h-3.5 w-16 animate-pulse rounded bg-white/[0.06]" />
                    </div>
                ))}
            </div>
        </div>
    );
}