"use client";

import {
    modalOverlayCn,
    MODAL_CARD_360,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CONFIRM_BTN_WIDE,
} from "../../ui-classes";

export function LogoutModal(props: { open: boolean; onClose: () => void; onLogout: () => void }) {
    const { open, onClose, onLogout } = props;

    return (
        <div
            id="logoutModalBackdrop"
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
                aria-labelledby="logoutModalTitle"
            >
                <div className={MODAL_HEADER}>
                    <div id="logoutModalTitle" className="text-[15px] font-bold text-white">
                        Logout?
                    </div>
                    <button
                        id="logoutModalClose"
                        className={MODAL_CLOSE_BTN}
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="grid place-items-center gap-[12px] p-[18px]">
                    <div className="flex justify-center">
                        <button
                            id="logoutModalLogout"
                            className={MODAL_CONFIRM_BTN_WIDE}
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
