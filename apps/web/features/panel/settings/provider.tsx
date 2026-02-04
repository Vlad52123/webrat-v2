"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { makeBgVideoDb } from "./bg-video-db";
import { applyBackgroundColor, applyBackgroundImage, applyBackgroundVideo, clearBackgroundColor, revokeBgVideoUrl, type BgMode } from "./background";
import { applySnow } from "./snow";
import { applyLineColor, enableRgbLines, setBaseLineColor } from "./rgb-line";
import {
   STORAGE_KEYS,
   migrateLegacyWsHostGlobal,
   migratePrefKey,
   normalizeWsHost,
   prefKey,
   readPref,
   readWsHostGlobal,
   writePref,
   writeWsHostGlobal,
} from "./storage";

export type SettingsState = {
   bgMode: BgMode;
   bgImage: string;
   bgColor: string;
   bgVideoMarker: string;
   lineColor: string;
   snow: boolean;
   rgb: boolean;
   soundVolume: number;
   wsHost: string;
};

type Ctx = {
   state: SettingsState;
   setBgMode: (mode: BgMode) => void;
   setBgImageFromFile: (file: File) => Promise<void>;
   setBgVideoFromFile: (file: File) => Promise<void>;
   setBgColor: (color: string) => void;
   setLineColor: (color: string) => void;
   setSnow: (on: boolean) => void;
   setRgb: (on: boolean) => void;
   setSoundVolume: (v: number) => void;
   setWsHost: (host: string) => void;
   reapply: () => Promise<void>;
};

const SettingsCtx = createContext<Ctx | null>(null);

function clamp01(v: number) {
   if (!Number.isFinite(v)) return 0;
   return Math.max(0, Math.min(1, v));
}

function parseSound(v: string) {
   const n = parseFloat(String(v || ""));
   if (Number.isNaN(n)) return 0.5;
   return clamp01(n);
}

function detectMode(bg: string, bgVideoMarker: string, bgMode: string): BgMode {
   const m = String(bgMode || "").toLowerCase();
   if (m === "video" || m === "image" || m === "default") return m as BgMode;
   if (bgVideoMarker) return "video";
   if (bg) return "image";
   return "default";
}

export function usePanelSettings() {
   const ctx = useContext(SettingsCtx);
   if (!ctx) throw new Error("settings_ctx_missing");
   return ctx;
}

export function PanelSettingsProvider(props: { contentRef: React.RefObject<HTMLElement | null>; children: React.ReactNode }) {
   const { contentRef, children } = props;

   const [state, setState] = useState<SettingsState>(() => {
      return {
         bgImage: "",
         bgVideoMarker: "",
         bgMode: "default",
         bgColor: "",
         lineColor: "",
         snow: false,
         rgb: false,
         soundVolume: 0.5,
         wsHost: "",
      };
   });

   const applyingRef = useRef<Promise<void> | null>(null);

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

         const db = makeBgVideoDb(prefKey("bgVideo"));
         const blob = await db.get();
         if (!blob) {
            revokeBgVideoUrl();
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
            applyBackgroundVideo(target, url, preview);
         } catch {
            return;
         }

         return;
      }

      applyBackgroundVideo(target, "", preview);

      if (next.bgMode === "image" && next.bgImage) {
         applyBackgroundImage(target, next.bgImage, preview);
         clearBackgroundColor(target, preview);
         return;
      }

      applyBackgroundImage(target, "", preview);
      clearBackgroundColor(target, preview);
      if (next.bgColor) applyBackgroundColor(target, next.bgColor, preview);
   }, [contentRef]);

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
   }, [applyToDom]);

   const reapply = useCallback(async () => {
      const p = applyToDom(state);
      applyingRef.current = p;
      try {
         await p;
      } finally {
         applyingRef.current = null;
      }
   }, [applyToDom, state]);

   useEffect(() => {
      void loadFromStorage();
      return () => {
         try {
            revokeBgVideoUrl();
         } catch {
            return;
         }
      };
   }, [loadFromStorage]);

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
   }, [applyToDom]);

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
   }, [applyToDom]);

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
   }, [applyToDom]);

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
   }, [applyToDom]);

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
   }, [applyToDom]);

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
   }, []);

   const setWsHost = useCallback((host: string) => {
      const v = normalizeWsHost(String(host || "").trim());
      setState((prev) => {
         const next = { ...prev, wsHost: v };
         writeWsHostGlobal(v);
         return next;
      });
   }, []);

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
   }, [applyToDom]);

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
   }, [contentRef]);

   const ctx = useMemo<Ctx>(
      () => ({
         state,
         setBgMode,
         setBgImageFromFile,
         setBgVideoFromFile,
         setBgColor,
         setLineColor,
         setSnow,
         setRgb,
         setSoundVolume,
         setWsHost,
         reapply,
      }),
      [reapply, setBgColor, setBgImageFromFile, setBgMode, setBgVideoFromFile, setLineColor, setRgb, setSnow, setSoundVolume, setWsHost, state],
   );

   return <SettingsCtx.Provider value={ctx}>{children}</SettingsCtx.Provider>;
}