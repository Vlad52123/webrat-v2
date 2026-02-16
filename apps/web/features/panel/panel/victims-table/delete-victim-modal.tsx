"use client";

export function DeleteVictimModal(props: {
    open: boolean;
    pendingDeleteId: string | null;
    onConfirm: (victimId: string) => void;
    onCancel: () => void;
}) {
    const { open, pendingDeleteId, onConfirm, onCancel } = props;

    if (!open || !pendingDeleteId) return null;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/[0.62] backdrop-blur-[10px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className="w-[340px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
                role="dialog"
                aria-modal="true"
                aria-label="Confirm delete"
            >
                <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
                    <div className="text-[15px] font-bold text-white">Delete victim</div>
                    <button
                        className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                        type="button"
                        aria-label="Close"
                        onClick={onCancel}
                    >
                        <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">×</span>
                    </button>
                </div>
                <div className="grid gap-[12px] p-[18px]">
                    <div className="text-center text-[14px] text-white/[0.9]">
                        Are you sure you want to delete this victim?
                    </div>
                    <div className="mt-[4px] flex justify-center gap-[12px]">
                        <button
                            className="min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            onClick={() => onConfirm(pendingDeleteId)}
                        >
                            Confirm
                        </button>
                        <button
                            className="min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.14] bg-white/[0.06] px-[22px] py-[10px] text-[14px] font-semibold text-white/[0.85] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
