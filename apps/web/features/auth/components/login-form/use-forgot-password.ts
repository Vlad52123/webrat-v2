"use client";

import { useCallback, useRef, useState } from "react";
import { showToast } from "@/features/panel/toast";
import { getCookie } from "@/lib/cookie";

type FormLike = {
    getValues: (name: any) => unknown;
    setValue: (name: any, value: any) => void;
};

type ForgotMode = false | "email" | "code";

const CODE_LENGTH = 8;
const TIMER_SECONDS = 300;

export function useForgotPassword(form: FormLike) {
    const [forgotMode, setForgotMode] = useState<ForgotMode>(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotCode, setForgotCode] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [timerLeft, setTimerLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const codeSentRef = useRef(false);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        const end = Date.now() + TIMER_SECONDS * 1000;
        setTimerLeft(TIMER_SECONDS);
        timerRef.current = setInterval(() => {
            const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
            setTimerLeft(left);
            if (left <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = null;
                codeSentRef.current = false;
            }
        }, 1000);
    }, []);

    const handleForgotSendCode = useCallback(async () => {
        const login = String(form.getValues("login") || "").trim();
        const email = forgotEmail.trim();
        if (!login || !email) {
            showToast("error", "Enter your login and email");
            return;
        }
        setForgotLoading(true);
        try {
            const csrf = getCookie("webrat_csrf");
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(csrf ? { "X-CSRF-Token": csrf } : {}),
                },
                body: JSON.stringify({ login, email }),
            });
            if (res.status === 404) {
                showToast("error", "Account not found or email doesn't match");
                return;
            }
            if (res.status === 429) {
                showToast("error", "Too many requests, try later");
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                if (data?.error === "unsupported_email_domain") {
                    showToast("error", "Unsupported email domain");
                    return;
                }
                showToast("error", "Failed to send reset code");
                return;
            }
            showToast("success", "Code sent to your email");
            codeSentRef.current = true;
            setForgotMode("code");
            startTimer();
        } catch {
            showToast("error", "Network error");
        } finally {
            setForgotLoading(false);
        }
    }, [forgotEmail, form, startTimer]);

    const handleForgotReset = useCallback(async () => {
        const login = String(form.getValues("login") || "").trim();
        const code = forgotCode.trim();
        const newPw = forgotNewPassword.trim();
        if (!login || !code || !newPw) {
            showToast("error", "Fill in all fields");
            return;
        }
        if (!/^[A-Za-z0-9_-]{6,24}$/.test(newPw)) {
            showToast("error", "Password: 6-24 chars (letters, digits, _ -)");
            return;
        }
        setForgotLoading(true);
        try {
            const csrf = getCookie("webrat_csrf");
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(csrf ? { "X-CSRF-Token": csrf } : {}),
                },
                body: JSON.stringify({ login, code, new_password: newPw }),
            });
            if (res.status === 401) {
                showToast("error", "Invalid or expired code");
                return;
            }
            if (!res.ok) {
                showToast("error", "Failed to reset password");
                return;
            }
            showToast("success", "Password reset! You can now login.");
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            codeSentRef.current = false;
            setTimerLeft(0);
            setForgotMode(false);
            setForgotEmail("");
            setForgotCode("");
            setForgotNewPassword("");
            form.setValue("password", "");
        } catch {
            showToast("error", "Network error");
        } finally {
            setForgotLoading(false);
        }
    }, [forgotCode, forgotNewPassword, form]);

    const backToLogin = useCallback(() => {
        setForgotMode(false);
    }, []);

    const openForgotPassword = useCallback(() => {
        if (codeSentRef.current && timerLeft > 0) {
            setForgotMode("code");
        } else {
            setForgotMode("email");
        }
    }, [timerLeft]);

    return {
        forgotMode,
        setForgotMode,
        forgotEmail,
        setForgotEmail,
        forgotCode,
        setForgotCode,
        forgotNewPassword,
        setForgotNewPassword,
        forgotLoading,
        timerLeft,
        handleForgotSendCode,
        handleForgotReset,
        backToLogin,
        openForgotPassword,
        codeLength: CODE_LENGTH,
    };
}
