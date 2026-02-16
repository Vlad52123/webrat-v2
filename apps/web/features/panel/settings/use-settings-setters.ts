import { useCallback } from "react";

import type { BgMode } from "./background";
import { applyLineColor, setBaseLineColor } from "./rgb-line";
import { STORAGE_KEYS, normalizeWsHost, writePref, writeWsHostGlobal } from "./storage";
import type { SettingsState } from "./provider";

function clamp01(v: number) {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(1, v));
}

export function useSettingsSetters(
    setState: React.Dispatch<React.SetStateAction<SettingsState>>,
    applyToDom: (next: SettingsState) => Promise<void>,
) {
    const setBgMode = useCallback((mode: BgMode) => {
        const m: BgMode = mode === "video" || mode === "image" ? mode : "default";
        setState((prev) => {
            const next = { ...prev, bgMode: m };
            try {
                writePref(STORAGE_KEYS.bgMode, m);
            } catch {
                return next;
            }
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setBgColor = useCallback((color: string) => {
        const v = String(color || "").trim();
        setState((prev) => {
            const next = { ...prev, bgColor: v };
            try {
                writePref(STORAGE_KEYS.bgColor, v);
            } catch {
                return next;
            }
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setLineColor = useCallback((color: string) => {
        const v = String(color || "").trim();
        setState((prev) => {
            const next = { ...prev, lineColor: v };
            try {
                writePref(STORAGE_KEYS.lineColor, v);
            } catch {
                return next;
            }
            setBaseLineColor(v);
            if (!next.rgb) applyLineColor(v);
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setSnow = useCallback((on: boolean) => {
        const v = !!on;
        setState((prev) => {
            const next = { ...prev, snow: v };
            try {
                writePref(STORAGE_KEYS.snow, v ? "on" : "off");
            } catch {
                return next;
            }
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setRgb = useCallback((on: boolean) => {
        const v = !!on;
        setState((prev) => {
            const next = { ...prev, rgb: v };
            try {
                writePref(STORAGE_KEYS.rgb, v ? "on" : "off");
            } catch {
                return next;
            }
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setSoundVolume = useCallback((v: number) => {
        const clamped = clamp01(v);
        setState((prev) => {
            const next = { ...prev, soundVolume: clamped };
            try {
                writePref(STORAGE_KEYS.sound, String(clamped));
            } catch {
                return next;
            }
            return next;
        });
    }, [setState]);

    const setWsHost = useCallback((host: string) => {
        const v = normalizeWsHost(String(host || "").trim());
        setState((prev) => {
            const next = { ...prev, wsHost: v };
            writeWsHostGlobal(v);
            return next;
        });
    }, [setState]);

    return { setBgMode, setBgColor, setLineColor, setSnow, setRgb, setSoundVolume, setWsHost };
}
