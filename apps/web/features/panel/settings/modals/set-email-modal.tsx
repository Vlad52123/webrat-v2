"use client";

import { useEffect, useRef, useState } from "react";
import { EmailBoundView } from "./email-bound-view";
import { EmailInputView } from "./email-input-view";

import {
    MODAL_OVERLAY_FLEX,
    MODAL_CARD_420,
    MODAL_HEADER,
    MODAL_CLOSE_BTN,
    MODAL_CLOSE_ICON,
} from "../../ui-classes";

export function SetEmailModal(props: {
    open: boolean;
    onClose: () => void;
    email: string;
    setEmail: (v: string) => void;
    passwordOrCode: string;
    setPasswordOrCode: (v: string) => void;
    step: "input" | "code";
    expiresAt: number;
    onConfirm: () => void;
    currentEmail: string;
    onDetach: (password: string) => void;
}) {
    const {
        open, onClose, email, setEmail, passwordOrCode, setPasswordOrCode,
        step, expiresAt, onConfirm, currentEmail, onDetach,
    } = props;

    const isBound = currentEmail !== "" && currentEmail !== "Not set";
    const [remaining, setRemaining] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (step !== "code" || !expiresAt) {
            setRemaining(0);
            return;
        }
        const tick = () => {
            const left = expiresAt - Date.now();
            if (left <= 0) {
                setRemaining(0);
                if (timerRef.current) clearInterval(timerRef.current);
            } else {
                setRemaining(left);
            }
        };
        tick();
        timerRef.current = setInterval(tick, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [step, expiresAt]);

    const timerExpired = step === "code" && expiresAt > 0 && remaining <= 0;

    if (!open) return null;

    return (
        <div
            id="emailModalBackdrop"
            className={MODAL_OVERLAY_FLEX}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={MODAL_CARD_420}
                role="dialog"
                aria-modal="true"
                aria-labelledby="emailModalTitle"
            >
                <div className={MODAL_HEADER}>
                    <div id="emailModalTitle" className="text-[15px] font-bold text-white">
                        {isBound ? "Your email" : "Set email"}
                    </div>
                    <button
                        id="emailModalClose"
                        className={MODAL_CLOSE_BTN}
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <span aria-hidden="true" className={MODAL_CLOSE_ICON}>×</span>
                    </button>
                </div>

                {isBound ? (
                    <EmailBoundView currentEmail={currentEmail} onDetach={onDetach} />
                ) : (
                    <EmailInputView
                        email={email}
                        setEmail={setEmail}
                        passwordOrCode={passwordOrCode}
                        setPasswordOrCode={setPasswordOrCode}
                        step={step}
                        expiresAt={expiresAt}
                        remaining={remaining}
                        timerExpired={timerExpired}
                        onConfirm={onConfirm}
                    />
                )}
            </div>
        </div>
    );
}
