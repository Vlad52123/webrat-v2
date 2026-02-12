"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, type MutableRefObject } from "react";

import { login } from "../../api";
import { type LoginValues } from "../../schemas";
import { showToast } from "@/features/panel/toast";
import type { SliderCaptchaHandle } from "../slider-captcha";

export function useLoginMutation({
    captchaRef,
    setCaptchaReady,
    setInputsError,
    clearSubmitCooldown,
    startCooldownForSeconds,
    setTurnstileToken,
    useTurnstile,
    turnstileToken,
}: {
    captchaRef: MutableRefObject<SliderCaptchaHandle | null>;
    setCaptchaReady: (v: boolean) => void;
    setInputsError: (v: boolean) => void;
    clearSubmitCooldown: () => void;
    startCooldownForSeconds: (s: number) => void;
    setTurnstileToken: (v: string) => void;
    useTurnstile: boolean;
    turnstileToken: string;
}) {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (values: LoginValues) => login(values, useTurnstile ? turnstileToken : ""),
        onSuccess: (_, values) => {
            setInputsError(false);
            clearSubmitCooldown();
            try {
                const loginKey = String(values?.login || "")
                    .trim()
                    .toLowerCase()
                    .replace(/[^A-Za-z0-9_-]/g, "")
                    .slice(0, 32);
                if (loginKey) localStorage.setItem("webrat_login", loginKey);
            } catch { }
            try {
                localStorage.removeItem("webrat_subscription_cache");
                const loginKey = String(values?.login || "")
                    .trim()
                    .toLowerCase()
                    .replace(/[^A-Za-z0-9_-]/g, "")
                    .slice(0, 32);
                if (loginKey) {
                    localStorage.removeItem(`webrat_subscription_cache:${loginKey}`);
                }
            } catch { }
            try {
                localStorage.setItem("webrat_post_auth", "1");
            } catch { }
            router.push("/panel/#shop");
        },
        onError: (err) => {
            const code = err instanceof Error ? err.message : "login_failed";

            if (err && typeof err === "object" && "status" in err && (err as { status?: unknown }).status === 429) {
                const ra = (err as { retryAfterSeconds?: unknown }).retryAfterSeconds;
                const secs = typeof ra === "number" && Number.isFinite(ra) && ra > 0 ? Math.min(60 * 60, ra) : 15 * 60;
                startCooldownForSeconds(secs);
                return;
            }

            if (code === "invalid_credentials" || code === "HTTP_401" || code === "HTTP_400") {
                showToast("error", "Invalid login or password");
                setInputsError(true);
                return;
            }

            if (code === "security_check_failed" || code === "HTTP_403") {
                showToast("error", "Security check failed. Refresh the page (Ctrl+F5) and try again.");
                setInputsError(true);
                captchaRef.current?.refresh();
                setCaptchaReady(false);
                return;
            }

            if (code === "HTTP_429") {
                startCooldownForSeconds(15 * 60);
                captchaRef.current?.refresh();
                setCaptchaReady(false);
                return;
            }

            if (code === "TURNSTILE_FAILED") {
                showToast("error", "Security check failed");
                setInputsError(true);
                setTurnstileToken("");
                setCaptchaReady(false);
                return;
            }

            showToast("error", "Login failed");
            setInputsError(true);
            captchaRef.current?.refresh();
            setCaptchaReady(false);
        },
    });

    return mutation;
}