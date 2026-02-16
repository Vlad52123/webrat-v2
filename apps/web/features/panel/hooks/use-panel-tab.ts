"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type PanelTabKey = "panel" | "builder" | "community" | "settings" | "shop";

function parseHash(hash: string): PanelTabKey | null {
    const raw = hash.replace(/^#/, "").trim();
    if (raw === "panel" || raw === "builder" || raw === "community" || raw === "settings" || raw === "shop") {
        return raw;
    }
    return null;
}

function ensureTrailingSlashPreservingHash() {
    if (typeof window === "undefined") return;
    const p = window.location.pathname;
    if (p.endsWith("/")) return;
    const next = `${p}/`;
    if (typeof history !== "undefined" && typeof history.replaceState === "function") {
        history.replaceState(null, "", `${next}${window.location.search}${window.location.hash}`);
    }
}

export function usePanelTab() {
    const [tab, setTabState] = useState<PanelTabKey>(() => {
        try {
            if (typeof window === "undefined") return "panel";
            const current = parseHash(window.location.hash);
            if (current) return current;
            const saved = parseHash(String(sessionStorage.getItem("webrat_last_hash") || ""));
            return saved ?? "panel";
        } catch {
            return "panel";
        }
    });

    useEffect(() => {
        ensureTrailingSlashPreservingHash();
        const current = parseHash(window.location.hash);
        if (current) return;

        try {
            const saved = parseHash(String(sessionStorage.getItem("webrat_last_hash") || ""));
            if (saved) {
                if (typeof history !== "undefined" && typeof history.replaceState === "function") {
                    const p = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;
                    history.replaceState(null, "", `${p}${window.location.search}#${saved}`);
                } else {
                    window.location.hash = `#${saved}`;
                }
                return;
            }
        } catch {
        }

        if (typeof history !== "undefined" && typeof history.replaceState === "function") {
            const p = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;
            history.replaceState(null, "", `${p}${window.location.search}#panel`);
        } else {
            window.location.hash = "#panel";
        }
    }, []);

    useEffect(() => {
        const onHashChange = () => {
            const next = parseHash(window.location.hash);
            setTabState(next ?? "panel");
            try {
                sessionStorage.setItem("webrat_last_hash", String(window.location.hash || ""));
            } catch {
            }
        };

        window.addEventListener("hashchange", onHashChange);
        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, []);

    const setTab = useCallback((next: PanelTabKey) => {
        if (typeof window === "undefined") return;
        ensureTrailingSlashPreservingHash();
        const target = `#${next}`;
        if (window.location.hash === target) return;
        window.location.hash = target;
    }, []);

    return useMemo(
        () => ({
            tab,
            setTab,
        }),
        [setTab, tab],
    );
}
