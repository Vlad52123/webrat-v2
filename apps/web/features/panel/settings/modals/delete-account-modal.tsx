"use client";

import {
    modalOverlayCn,
    MODAL_CARD_360,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CONFIRM_BTN_WIDE,
} from "../../ui-classes";

export function DeleteAccountModal(props: {
    open: boolean;
    onClose: () => void;
    password: string;
    setPassword: (v: string) => void;
    error: string;
    setError: (v: string) => void;
    onConfirm: (password: string) => void;
}) {
    const { open, onClose, password, setPassword, error, setError, onConfirm } = props;

    return (
        <div
            id="deleteModalBackdrop"
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
                aria-labelledby="deleteModalTitle"
            >
                <div className={MODAL_HEADER}>
                    <div id="deleteModalTitle" className="text-[15px] font-bold text-white">
                        Delete account
                    </div>
                    <button
                        id="deleteModalClose"
                        className={MODAL_CLOSE_BTN}
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="grid gap-[12px] p-[18px] text-center">
                    <div className="mb-[6px] text-[18px] font-black tracking-[0.08em] text-[#ff5555] [text-shadow:0_0_4px_#ff5555]">
                        WARNING
                    </div>
                    <div className="text-[13px] font-semibold text-white/[0.82]">This action is irreversible.</div>
                    <div className="text-[13px] font-semibold text-white/[0.82]">Your username and subscription may be lost.</div>

                    <div className="grid gap-[4px]">
                        <input
                            id="deleteModalPassword"
                            className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                        />
                        {error ? <div className="text-[12px] font-semibold text-[#ff7070]">{error}</div> : null}
                    </div>

                    <div className="mt-[10px] flex justify-center">
                        <button
                            id="deleteModalConfirm"
                            className={MODAL_CONFIRM_BTN_WIDE}
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            onClick={() => onConfirm(String(password || "").trim())}
                        >
                            Delete forever
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
