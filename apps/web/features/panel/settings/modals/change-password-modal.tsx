"use client";

import {
    modalOverlayCn,
    MODAL_CARD_360,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CONFIRM_BTN_WIDE,
    MODAL_INPUT,
} from "../../ui-classes";

export function ChangePasswordModal(props: {
    open: boolean;
    onClose: () => void;
    isLoading?: boolean;
    oldPassword: string;
    setOldPassword: (v: string) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    newPasswordAgain: string;
    setNewPasswordAgain: (v: string) => void;
    onConfirm: () => void;
}) {
    const {
        open,
        onClose,
        isLoading,
        oldPassword,
        setOldPassword,
        newPassword,
        setNewPassword,
        newPasswordAgain,
        setNewPasswordAgain,
        onConfirm,
    } = props;

    return (
        <div
            id="passwordModalBackdrop"
            className={modalOverlayCn(open)}
            aria-hidden={!open}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={MODAL_CARD_360}
                role="dialog"
                aria-modal="true"
                aria-labelledby="passwordModalTitle"
            >
                <div className={MODAL_HEADER}>
                    <div id="passwordModalTitle" className="text-[15px] font-bold text-white">
                        Change password
                    </div>
                    <button
                        id="passwordModalClose"
                        className={MODAL_CLOSE_BTN}
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">
                            ×
                        </span>
                    </button>
                </div>

                <div className="grid gap-[12px] p-[18px]">
                    <div className="grid gap-[4px]">
                        <input
                            id="passwordOldInput"
                            className={MODAL_INPUT}
                            type="password"
                            autoComplete="current-password"
                            placeholder="Old password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-[4px]">
                        <input
                            id="passwordNewInput"
                            className={MODAL_INPUT}
                            type="password"
                            autoComplete="new-password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-[4px]">
                        <input
                            id="passwordNewAgainInput"
                            className={MODAL_INPUT}
                            type="password"
                            autoComplete="new-password"
                            placeholder="New password again"
                            value={newPasswordAgain}
                            onChange={(e) => setNewPasswordAgain(e.target.value)}
                        />
                    </div>

                    <div className="mt-[8px] flex justify-center">
                        <button
                            id="passwordModalConfirm"
                            className={
                                MODAL_CONFIRM_BTN_WIDE +
                                (isLoading ? " pointer-events-none opacity-60" : "")
                            }
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            disabled={Boolean(isLoading)}
                            onClick={onConfirm}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
