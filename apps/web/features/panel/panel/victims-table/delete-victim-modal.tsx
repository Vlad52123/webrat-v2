"use client";

import {
    MODAL_OVERLAY_FLEX,
    MODAL_CARD_340,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CLOSE_ICON,
    MODAL_CONFIRM_BTN,
    MODAL_CANCEL_BTN,
} from "../../ui-classes";

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
            className={MODAL_OVERLAY_FLEX}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                className={MODAL_CARD_340}
                role="dialog"
                aria-modal="true"
                aria-label="Confirm delete"
            >
                <div className={MODAL_HEADER}>
                    <div className="text-[15px] font-bold text-white">Delete victim</div>
                    <button
                        className={MODAL_CLOSE_BTN}
                        type="button"
                        aria-label="Close"
                        onClick={onCancel}
                    >
                        <span aria-hidden="true" className={MODAL_CLOSE_ICON}>×</span>
                    </button>
                </div>
                <div className="grid gap-[12px] p-[18px]">
                    <div className="text-center text-[14px] text-white/[0.9]">
                        Are you sure you want to delete this victim?
                    </div>
                    <div className="mt-[4px] flex justify-center gap-[12px]">
                        <button
                            className={MODAL_CONFIRM_BTN}
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            onClick={() => onConfirm(pendingDeleteId)}
                        >
                            Confirm
                        </button>
                        <button
                            className={MODAL_CANCEL_BTN}
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
