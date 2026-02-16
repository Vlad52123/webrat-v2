import { useEffect, useMemo, useState } from "react";

function formatDateTime(iso: unknown): string {
    if (!iso) return "Unknown";
    const d = new Date(String(iso));
    if (!Number.isFinite(d.getTime())) return "Unknown";
    try {
        return d.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Unknown";
    }
}

export function useSecurityInfo() {
    const [securityLogin, setSecurityLogin] = useState("-");
    const [securitySub, setSecuritySub] = useState("...");
    const [securitySubLoading, setSecuritySubLoading] = useState(true);
    const [securityEmail, setSecurityEmail] = useState("Not set");
    const [securityRegDate, setSecurityRegDate] = useState("Unknown");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/me/`, { method: "GET", credentials: "include" });
                if (!res.ok) return;
                const data = (await res.json()) as unknown;
                if (cancelled) return;
                const login = (() => {
                    if (typeof data !== "object" || !data) return "-";
                    const user = (data as { user?: unknown }).user;
                    if (typeof user !== "object" || !user) return "-";
                    const l = (user as { login?: unknown }).login;
                    return typeof l === "string" && l ? l : "-";
                })();
                setSecurityLogin(login || "-");
            } catch {
                return;
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setSecuritySubLoading(true);
                const res = await fetch(`/api/subscription/`, { method: "GET", credentials: "include" });
                if (!res.ok) return;
                const data = (await res.json().catch(() => null)) as unknown;
                if (cancelled) return;
                const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
                const status = String(obj?.status || "none").toLowerCase();
                setSecuritySub(status === "vip" ? "RATER" : "NONE");
            } catch {
                return;
            } finally {
                if (!cancelled) setSecuritySubLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/account/`, { method: "GET", credentials: "include" });
                if (!res.ok) return;
                const data = (await res.json().catch(() => null)) as unknown;
                if (cancelled) return;

                const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

                const email = String(obj?.email || "").trim();
                setSecurityEmail(email ? email : "Not set");

                setSecurityRegDate(formatDateTime(obj?.created_at));
            } catch {
                return;
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const securitySubDisplay = useMemo(() => {
        return securitySubLoading ? "..." : securitySub;
    }, [securitySub, securitySubLoading]);

    return {
        securityLogin,
        securitySub,
        securitySubLoading,
        securitySubDisplay,
        securityEmail,
        setSecurityEmail,
        securityRegDate,
    };
}
