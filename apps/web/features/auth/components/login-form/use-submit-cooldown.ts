import { useCallback, useEffect, useRef, useState } from "react";

type Params = {
    showToast: (type: string, message: string) => void;
    setInputsError: (v: boolean) => void;
};

export function useSubmitCooldown(p: Params) {
    const { showToast, setInputsError } = p;

    const submitCooldownUntilRef = useRef<number>(0);
    const submitCooldownTimerRef = useRef<number | null>(null);
    const lastCooldownLeftSecRef = useRef<number>(-1);

    const [cooldownTick, setCooldownTick] = useState(0);

    const clearSubmitCooldown = useCallback(() => {
        submitCooldownUntilRef.current = 0;
        lastCooldownLeftSecRef.current = -1;
        if (submitCooldownTimerRef.current) {
            window.clearInterval(submitCooldownTimerRef.current);
            submitCooldownTimerRef.current = null;
        }
    }, []);

    const ensureSubmitCooldownTimer = useCallback(() => {
        if (submitCooldownTimerRef.current) return;
        submitCooldownTimerRef.current = window.setInterval(() => {
            const until = submitCooldownUntilRef.current;
            if (!until) {
                clearSubmitCooldown();
                return;
            }

            const leftMs = until - Date.now();
            if (leftMs <= 0) {
                clearSubmitCooldown();
                setCooldownTick((x) => x + 1);
                return;
            }

            const left = Math.max(1, Math.ceil(leftMs / 1000));
            if (left !== lastCooldownLeftSecRef.current) {
                lastCooldownLeftSecRef.current = left;
                const mm = Math.floor(left / 60);
                const ss = left % 60;
                const pretty = mm > 0 ? `${mm}m ${String(ss).padStart(2, "0")}s` : `${left} seconds`;
                showToast("warning", `Blocked. Wait ${pretty}`);
                setCooldownTick((x) => x + 1);
            }
        }, 250);
    }, [clearSubmitCooldown, showToast]);

    useEffect(() => {
        return () => {
            if (submitCooldownTimerRef.current) {
                window.clearInterval(submitCooldownTimerRef.current);
                submitCooldownTimerRef.current = null;
            }
        };
    }, []);

    const startCooldownForSeconds = useCallback(
        (secs: number) => {
            const s = typeof secs === "number" && Number.isFinite(secs) && secs > 0 ? secs : 15 * 60;
            submitCooldownUntilRef.current = Date.now() + s * 1000;
            lastCooldownLeftSecRef.current = -1;
            ensureSubmitCooldownTimer();
            setInputsError(true);
            setCooldownTick((x) => x + 1);
        },
        [ensureSubmitCooldownTimer, setInputsError],
    );

    const isCooldownActive = useCallback(() => {
        return !!(submitCooldownUntilRef.current && Date.now() < submitCooldownUntilRef.current);
    }, []);

    const showCooldownNoticeNow = useCallback(() => {
        if (!isCooldownActive()) return;
        const leftMs = submitCooldownUntilRef.current - Date.now();
        const left = Math.max(1, Math.ceil(leftMs / 1000));
        const mm = Math.floor(left / 60);
        const ss = left % 60;
        const pretty = mm > 0 ? `${mm}m ${String(ss).padStart(2, "0")}s` : `${left} seconds`;
        setInputsError(true);
        showToast("warning", `Blocked. Wait ${pretty}`);
    }, [isCooldownActive, setInputsError, showToast]);

    return {
        cooldownTick,
        submitCooldownUntilRef,
        clearSubmitCooldown,
        ensureSubmitCooldownTimer,
        startCooldownForSeconds,
        isCooldownActive,
        showCooldownNoticeNow,
    };
}
