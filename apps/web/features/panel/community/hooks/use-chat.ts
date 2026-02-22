import { useCallback, useEffect, useRef, useState } from "react";

import { getCookie } from "@/lib/cookie";

export type ChatMsg = {
    id: number;
    login: string;
    message: string;
    image_url: string;
    created_at: string;
    avatar_url: string;
    subscription_status: string;
    user_created_at: string;
};

export type ChatPermissions = {
    canWrite: boolean;
    reason: "ok" | "no_email" | "no_subscription" | "loading";
};

function csrfHeaders(): Record<string, string> {
    const csrf = getCookie("webrat_csrf");
    return csrf ? { "X-CSRF-Token": csrf } : {};
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch("/api/chat", { credentials: "include" });
            if (!res.ok) return;
            const data = (await res.json()) as ChatMsg[];
            if (Array.isArray(data)) setMessages(data);
        } catch {
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchMessages().finally(() => setLoading(false));

        intervalRef.current = setInterval(() => {
            void fetchMessages();
        }, 8000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchMessages]);

    const sendMessage = useCallback(async (message: string, imageURL: string) => {
        const res = await fetch("/api/chat", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...csrfHeaders() },
            body: JSON.stringify({ message, image_url: imageURL }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            let errKey = "";
            try {
                const j = JSON.parse(text);
                errKey = j?.error || "";
            } catch {
            }
            throw new Error(errKey || `status ${res.status}`);
        }
        await fetchMessages();
    }, [fetchMessages]);

    const uploadImage = useCallback(async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/chat-image", {
            method: "POST",
            credentials: "include",
            headers: { ...csrfHeaders() },
            body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = (await res.json()) as { url?: string };
        return data.url || "";
    }, []);

    return { messages, loading, sendMessage, uploadImage, refresh: fetchMessages };
}

export function useChatPermissions(): ChatPermissions {
    const [perm, setPerm] = useState<ChatPermissions>({ canWrite: false, reason: "loading" });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [accRes, subRes] = await Promise.all([
                    fetch("/api/account/", { credentials: "include" }),
                    fetch("/api/subscription/", { credentials: "include" }),
                ]);

                if (cancelled) return;

                let hasEmail = false;
                let hasSub = false;

                if (accRes.ok) {
                    const acc = (await accRes.json().catch(() => null)) as Record<string, unknown> | null;
                    const email = String(acc?.email || "").trim();
                    hasEmail = !!email;
                }

                if (subRes.ok) {
                    const sub = (await subRes.json().catch(() => null)) as Record<string, unknown> | null;
                    const status = String(sub?.status || "").toLowerCase();
                    hasSub = status === "vip";
                }

                if (!hasEmail) {
                    setPerm({ canWrite: false, reason: "no_email" });
                } else if (!hasSub) {
                    setPerm({ canWrite: false, reason: "no_subscription" });
                } else {
                    setPerm({ canWrite: true, reason: "ok" });
                }
            } catch {
                setPerm({ canWrite: false, reason: "no_email" });
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return perm;
}
