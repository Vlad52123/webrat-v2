"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { BgMode } from "./background";
import { useApplyToDom } from "./use-apply-to-dom";
import { useSettingsSetters } from "./use-settings-setters";
import { useBgFileHandlers } from "./use-bg-file-handlers";
import { buildInitialState, useLoadSettings } from "./use-load-settings";

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

export function usePanelSettings() {
   const ctx = useContext(SettingsCtx);
   if (!ctx) throw new Error("settings_ctx_missing");
   return ctx;
}

export function PanelSettingsProvider(props: { contentRef: React.RefObject<HTMLElement | null>; children: React.ReactNode }) {
   const { contentRef, children } = props;

   const [state, setState] = useState<SettingsState>(buildInitialState);

   const { applyToDom } = useApplyToDom(contentRef, setState);
   const { setBgMode, setBgColor, setLineColor, setSnow, setRgb, setSoundVolume, setWsHost } = useSettingsSetters(setState, applyToDom);
   const { setBgImageFromFile, setBgVideoFromFile } = useBgFileHandlers(contentRef, setState, applyToDom);
   const { loadFromStorage, cleanup } = useLoadSettings(setState, applyToDom);

   const applyingRef = useRef<Promise<void> | null>(null);

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
      return cleanup;
   }, [loadFromStorage, cleanup]);

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