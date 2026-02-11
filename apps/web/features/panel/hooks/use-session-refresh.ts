"use client";

import { useEffect, useRef } from "react";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export function useSessionRefresh() {
    const lastCheckAt = useRef(Date.now());
    const didRedirect = useRef(false);

    useEffect(() => {
        const check = async () => {
            if (didRedirect.current) return;

            const now = Date.now();
            if (now - lastCheckAt.current < SESSION_CHECK_INTERVAL) return;
            lastCheckAt.current = now;

            try {
                const res = await fetch("/api/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 401 && !didRedirect.current) {
                    didRedirect.current = true;
                    window.location.href = "/login/";
                }
            } catch {
            }
        };

        const timer = window.setInterval(check, SESSION_CHECK_INTERVAL);

        const onFocus = () => {
            void check();
        };
        window.addEventListener("focus", onFocus);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, []);
}
