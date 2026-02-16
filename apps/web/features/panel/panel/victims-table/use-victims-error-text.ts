import { useMemo } from "react";

export function useVictimsErrorText(isError: boolean, error: unknown): string {
    return useMemo(() => {
        if (!isError) return "";
        const e = error as (Error & { status?: number }) | null;
        const st = typeof e?.status === "number" ? e.status : null;
        if (st === 401) return "unauthorized";
        if (st === 403) return "premium required";
        if (st === 502) return "server response error";

        if (st != null) return `HTTP_${st}`;
        const msg = e?.message ? String(e.message) : "failed";
        const lower = msg.toLowerCase();
        if (lower.includes("invalid_type") || lower.includes("expected") || lower.includes("zod")) {
            return "server response error";
        }
        return msg.length > 80 ? `${msg.slice(0, 80)}...` : msg;
    }, [error, isError]);
}
