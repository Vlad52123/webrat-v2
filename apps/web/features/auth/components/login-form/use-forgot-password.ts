"use client";

import { useCallback, useState } from "react";
import { showToast } from "@/features/panel/toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormLike = {
    getValues: (name: string) => unknown;
    setValue: (name: string, value: string) => void;
};

type ForgotMode = false | "email" | "code";

export function useForgotPassword(form: FormLike) {
    const [forgotMode, setForgotMode] = useState<ForgotMode>(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotCode, setForgotCode] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleForgotSendCode = useCallback(async () => {
        const login = String(form.getValues("login") || "").trim();
        const email = forgotEmail.trim();
        if (!login || !email) {
            showToast("error", "Enter your login and email");
            return;
        }
        setForgotLoading(true);
        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            setForgotMode("code");
        } catch {
            showToast("error", "Network error");
        } finally {
            setForgotLoading(false);
        }
    }, [forgotEmail, form]);

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
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
        setForgotEmail("");
        setForgotCode("");
        setForgotNewPassword("");
    }, []);

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
        handleForgotSendCode,
        handleForgotReset,
        backToLogin,
    };
}