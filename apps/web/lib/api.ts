import { env } from "../env";
import { getCookie } from "./cookie";

export const API_BASE_URL = env.NEXT_PUBLIC_API_URL ?? "";

function resolveUrl(path: string): string {
    const p = String(path || "");
    if (typeof window !== "undefined") {
        return p;
    }
    return `${API_BASE_URL}${p}`;
}

type JsonObject = Record<string, unknown>;

function safeParseJSON(text: string): unknown {
    const t = String(text ?? "");
    if (!t.trim()) return null;
    try {
        return JSON.parse(t) as unknown;
    } catch {
        return null;
    }
}

export async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(resolveUrl(path), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    const text = await res.text();
    const data = safeParseJSON(text);

    if (!res.ok) {
        const message =
            typeof data === "object" && data && "error" in data
                ? String((data as { error: unknown }).error)
                : `HTTP_${res.status}`;

        const err = new Error(message) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }

    return data as T;
}

export async function postJson<T>(path: string, body: JsonObject): Promise<T> {
    const csrf = getCookie("webrat_csrf");
    const res = await fetch(resolveUrl(path), {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    const data = safeParseJSON(text);

    if (!res.ok) {
        const message =
            typeof data === "object" && data && "error" in data
                ? String((data as { error: unknown }).error)
                : `HTTP_${res.status}`;

        const err = new Error(message) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }

    return data as T;
}
