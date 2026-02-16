"use client";

import { useEffect, useRef, useState } from "react";
import { EmailBoundView } from "./email-bound-view";
import { EmailInputView } from "./email-input-view";

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
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/[0.62] backdrop-blur-[10px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="w-[420px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="emailModalTitle"
            >
                <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
                    <div id="emailModalTitle" className="text-[15px] font-bold text-white">
                        {isBound ? "Your email" : "Set email"}
                    </div>
                    <button
                        id="emailModalClose"
                        className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">×</span>
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
