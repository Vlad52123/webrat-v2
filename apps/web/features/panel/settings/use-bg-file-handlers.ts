import { useCallback } from "react";

import { applyBackgroundImage, applyBackgroundVideo, clearBackgroundColor } from "./background";
import { makeBgVideoDb } from "./bg-video-db";
import { STORAGE_KEYS, prefKey, writePref } from "./storage";
import type { SettingsState } from "./provider";

export function useBgFileHandlers(
    contentRef: React.RefObject<HTMLElement | null>,
    setState: React.Dispatch<React.SetStateAction<SettingsState>>,
    applyToDom: (next: SettingsState) => Promise<void>,
) {
    const setBgImageFromFile = useCallback(async (file: File) => {
        if (!file || !file.type || !file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) return;

        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
        });

        setState((prev) => {
            const next: SettingsState = { ...prev, bgImage: dataUrl, bgMode: dataUrl ? "image" : prev.bgMode };
            try {
                writePref(STORAGE_KEYS.bgImage, dataUrl);
                writePref(STORAGE_KEYS.bgMode, "image");
            } catch {
                return next;
            }
            void applyToDom(next);
            return next;
        });
    }, [applyToDom, setState]);

    const setBgVideoFromFile = useCallback(async (file: File) => {
        if (!file || !file.type) return;
        const t = String(file.type || "").toLowerCase();
        if (t !== "video/mp4" && t !== "video/webm") return;
        if (file.size > 25 * 1024 * 1024) return;

        const db = makeBgVideoDb(prefKey("bgVideo"));
        const ok = await db.set(file);
        if (!ok) return;

        let url = "";
        try {
            url = URL.createObjectURL(file);
        } catch {
            url = "";
        }
        if (!url) return;

        setState((prev) => {
            const next: SettingsState = { ...prev, bgVideoMarker: "1", bgMode: "video" };
            try {
                writePref(STORAGE_KEYS.bgVideo, "1");
                writePref(STORAGE_KEYS.bgMode, "video");
            } catch {
                return next;
            }

            const target = contentRef.current;
            const preview = document.getElementById("settingsBgPreview");
            if (target) {
                applyBackgroundVideo(target, url, preview);

                try {
                    const video = target.querySelector<HTMLVideoElement>("#uiBgVideo");
                    if (video) {
                        const onReady = () => {
                            try {
                                applyBackgroundImage(target, "", preview);
                                clearBackgroundColor(target, preview);
                            } catch {
                            }
                        };
                        video.addEventListener("canplay", onReady, { once: true });
                    }
                } catch {
                }
            }
            return next;
        });
    }, [contentRef, setState]);

    return { setBgImageFromFile, setBgVideoFromFile };
}
