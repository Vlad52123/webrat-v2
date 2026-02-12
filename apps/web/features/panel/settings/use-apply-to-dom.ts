import { useCallback, useRef } from "react";

import { applyBackgroundColor, applyBackgroundImage, applyBackgroundVideo, clearBackgroundColor, revokeBgVideoUrl, type BgMode } from "./background";
import { applySnow } from "./snow";
import { applyLineColor, enableRgbLines, setBaseLineColor } from "./rgb-line";
import { makeBgVideoDb } from "./bg-video-db";
import { STORAGE_KEYS, prefKey, writePref } from "./storage";
import type { SettingsState } from "./provider";

export function detectMode(bg: string, bgVideoMarker: string, bgMode: string): BgMode {
    const m = String(bgMode || "").toLowerCase();
    if (m === "video" || m === "image" || m === "default") return m as BgMode;
    if (bgVideoMarker) return "video";
    if (bg) return "image";
    return "default";
}

export function useApplyToDom(
    contentRef: React.RefObject<HTMLElement | null>,
    setState: React.Dispatch<React.SetStateAction<SettingsState>>,
) {
    const bgVideoUrlRef = useRef<string>("");
    const bgVideoMarkerRef = useRef<string>("");

    const applyToDom = useCallback(async (next: SettingsState) => {
        const target = contentRef.current;
        if (!target) return;

        const preview = document.getElementById("settingsBgPreview");

        const hasVideoMarker = !!String(next.bgVideoMarker || "").trim();

        try {
            document.body.classList.toggle("hasCustomBg", !!next.bgImage || hasVideoMarker);
        } catch {
            return;
        }

        setBaseLineColor(String(next.lineColor || "").trim());

        if (next.rgb) {
            enableRgbLines(true);
        } else {
            enableRgbLines(false);
            applyLineColor(next.lineColor);
        }

        applySnow(next.snow);

        if (next.bgMode === "video") {
            applyBackgroundImage(target, "", preview);
            clearBackgroundColor(target, preview);

            const marker = String(next.bgVideoMarker || "").trim();
            if (marker && bgVideoUrlRef.current && bgVideoMarkerRef.current === marker) {
                applyBackgroundVideo(target, bgVideoUrlRef.current, preview);
                return;
            }

            const db = makeBgVideoDb(prefKey("bgVideo"));
            const blob = await db.get();
            if (!blob) {
                revokeBgVideoUrl();
                bgVideoUrlRef.current = "";
                bgVideoMarkerRef.current = "";
                applyBackgroundVideo(target, "", preview);
                try {
                    writePref(STORAGE_KEYS.bgVideo, "");
                    writePref(STORAGE_KEYS.bgMode, "default");
                } catch {
                    return;
                }
                const fallbackMode = detectMode(next.bgImage, "", "default");
                const merged: SettingsState = { ...next, bgVideoMarker: "", bgMode: fallbackMode };
                setState(merged);
                if (fallbackMode === "image") {
                    applyBackgroundVideo(target, "", preview);
                    applyBackgroundImage(target, next.bgImage, preview);
                    clearBackgroundColor(target, preview);
                } else {
                    applyBackgroundVideo(target, "", preview);
                    applyBackgroundImage(target, "", preview);
                    if (next.bgColor) applyBackgroundColor(target, next.bgColor, preview);
                }
                return;
            }

            try {
                const url = URL.createObjectURL(blob);
                bgVideoUrlRef.current = url;
                bgVideoMarkerRef.current = marker || "1";
                applyBackgroundVideo(target, url, preview);
            } catch {
                return;
            }

            return;
        }

        applyBackgroundVideo(target, "", preview);
        bgVideoUrlRef.current = "";
        bgVideoMarkerRef.current = "";

        if (next.bgMode === "image" && next.bgImage) {
            applyBackgroundImage(target, next.bgImage, preview);
            clearBackgroundColor(target, preview);
            return;
        }

        applyBackgroundImage(target, "", preview);
        clearBackgroundColor(target, preview);
        if (next.bgColor) applyBackgroundColor(target, next.bgColor, preview);
    }, [contentRef, setState]);

    return { applyToDom, bgVideoUrlRef, bgVideoMarkerRef };
}