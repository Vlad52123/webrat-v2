"use client";

import { useCallback, useState } from "react";

export function useToast() {
    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const show = useCallback((type: "success" | "error", text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return { toast, show };
}

export function Toast({ toast }: { toast: { type: "success" | "error"; text: string } | null }) {
    if (!toast) return null;
    return (
        <div
            className={`fixed top-4 left-4 right-4 z-[9999] animate-[slideDown_0.3s_ease] rounded-2xl px-5 py-3.5 text-center text-[14px] font-semibold backdrop-blur-xl ${toast.type === "success"
                ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                : "border border-red-400/20 bg-red-500/10 text-red-400"
                }`}
        >
            {toast.text}
        </div>
    );
}