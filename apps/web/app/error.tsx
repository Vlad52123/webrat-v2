"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#0a0a12]">
            <div className="text-[48px]">⚠️</div>
            <h2 className="text-[20px] font-bold text-white">Something went wrong</h2>
            <p className="max-w-[420px] text-center text-[14px] text-white/50">
                {error?.message || "An unexpected error occurred"}
            </p>
            <button
                onClick={() => {
                    reset();
                    window.location.reload();
                }}
                className="mt-2 cursor-pointer rounded-full border border-[rgba(214,154,255,0.42)] bg-[rgba(117,61,255,0.82)] px-8 py-2.5 text-[16px] font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset] transition-all duration-150 hover:-translate-y-px hover:bg-[rgba(117,61,255,0.88)] hover:shadow-[0_22px_52px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_22px_56px_rgba(117,61,255,0.24)] hover:[filter:brightness(1.06)] active:translate-y-0 active:[filter:brightness(0.94)]"
            >
                Reload
            </button>
        </div>
    );
}
