import { useCallback } from "react";

import { revokeBgVideoUrl, type BgMode } from "./background";
import {
    STORAGE_KEYS,
    migrateLegacyWsHostGlobal,
    migratePrefKey,
    readPref,
    readWsHostGlobal,
} from "./storage";
import type { SettingsState } from "./provider";
import { detectMode } from "./use-apply-to-dom";

function parseSound(v: string) {
    const n = parseFloat(String(v || ""));
    if (Number.isNaN(n)) return 0.5;
    const val = Math.max(0, Math.min(1, n));
    return Number.isFinite(val) ? val : 0;
}

export function buildInitialState(): SettingsState {
    try {
        const bg = readPref(STORAGE_KEYS.bgImage);
        const bgVideoMarker = readPref(STORAGE_KEYS.bgVideo);
        const bgModeRaw = readPref(STORAGE_KEYS.bgMode);
        const bgColor = readPref(STORAGE_KEYS.bgColor);
        const lineColor = readPref(STORAGE_KEYS.lineColor);
        const snowRaw = readPref(STORAGE_KEYS.snow);
        const rgbRaw = readPref(STORAGE_KEYS.rgb);
        const soundRaw = readPref(STORAGE_KEYS.sound);
        const wsHost = readWsHostGlobal();

        return {
            bgImage: bg,
            bgVideoMarker,
            bgColor,
            lineColor,
            snow: String(snowRaw || "").toLowerCase() === "on",
            rgb: String(rgbRaw || "").toLowerCase() === "on",
            soundVolume: parseSound(soundRaw),
            wsHost,
            bgMode: detectMode(bg, bgVideoMarker, bgModeRaw),
        };
    } catch {
        return {
            bgImage: "",
            bgVideoMarker: "",
            bgMode: "default" as BgMode,
            bgColor: "",
            lineColor: "",
            snow: false,
            rgb: false,
            soundVolume: 0.5,
            wsHost: "",
        };
    }
}

export function useLoadSettings(
    setState: React.Dispatch<React.SetStateAction<SettingsState>>,
    applyToDom: (next: SettingsState) => Promise<void>,
) {
    const loadFromStorage = useCallback(async () => {
        try {
            migrateLegacyWsHostGlobal();
            Object.values(STORAGE_KEYS).forEach((k) => migratePrefKey(k));
        } catch {
            return;
        }

        const bg = readPref(STORAGE_KEYS.bgImage);
        const bgVideoMarker = readPref(STORAGE_KEYS.bgVideo);
        const bgModeRaw = readPref(STORAGE_KEYS.bgMode);
        const bgColor = readPref(STORAGE_KEYS.bgColor);
        const lineColor = readPref(STORAGE_KEYS.lineColor);
        const snowRaw = readPref(STORAGE_KEYS.snow);
        const rgbRaw = readPref(STORAGE_KEYS.rgb);
        const soundRaw = readPref(STORAGE_KEYS.sound);
        const wsHost = readWsHostGlobal();

        const next: SettingsState = {
            bgImage: bg,
            bgVideoMarker,
            bgColor,
            lineColor,
            snow: String(snowRaw || "").toLowerCase() === "on",
            rgb: String(rgbRaw || "").toLowerCase() === "on",
            soundVolume: parseSound(soundRaw),
            wsHost,
            bgMode: detectMode(bg, bgVideoMarker, bgModeRaw),
        };

        setState(next);
        await applyToDom(next);
    }, [applyToDom, setState]);

    const cleanup = useCallback(() => {
        try {
            revokeBgVideoUrl();
        } catch {
            return;
        }
    }, []);

    return { loadFromStorage, cleanup };
}