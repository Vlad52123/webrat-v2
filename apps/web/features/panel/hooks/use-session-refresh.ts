"use client";

import { useEffect, useRef } from "react";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export function useSessionRefresh() {
    const lastCheckAt = useRef(Date.now());

    useEffect(() => {
        const check = async () => {
            const now = Date.now();
            if (now - lastCheckAt.current < SESSION_CHECK_INTERVAL) return;
            lastCheckAt.current = now;

            try {
                const res = await fetch("/api/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 401) {
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
