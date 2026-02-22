"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";

import type { BgMode } from "../background";
import type { SettingsState } from "../provider";
import type { SettingsTabKey } from "../../state/settings-tab";
import { useSoundPreview } from "./personalization/use-sound-preview";
import { WsServerSelect } from "./personalization/ws-server-select";
import { BackgroundPreview } from "./personalization/background-preview";
import { BackgroundControls } from "./personalization/background-controls";
import { ToggleRow } from "./personalization/toggle-row";
import { AvatarPicker } from "./personalization/avatar-picker";

export function PersonalizationPane(props: {
    tab: SettingsTabKey;
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
    wsSelectValue: string;
    wsWrapRef: RefObject<HTMLDivElement | null>;
    wsBtnRef: RefObject<HTMLButtonElement | null>;
    wsMenuRef: RefObject<HTMLDivElement | null>;
    wsOpen: boolean;
    setWsOpen: Dispatch<SetStateAction<boolean>>;
    wsMenuPos: { left: number; top: number; width: number } | null;
}) {
    const {
        tab,
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
        wsSelectValue,
        wsWrapRef,
        wsBtnRef,
        wsMenuRef,
        wsOpen,
        setWsOpen,
        wsMenuPos,
    } = props;

    const playSoundPreview = useSoundPreview();

    return (
        <div className="min-h-[220px]" data-settings-pane="personalization" style={{ display: tab === "personalization" ? "block" : "none" }}>
            <div className="grid gap-5">
                <div className="overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px] min-h-[260px]">
                    <div className="mb-[12px] ml-[2px] mt-[2px]">
                        <div className="text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]">Personalization</div>
                    </div>
                    <div className="grid grid-cols-1 gap-[16px] md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start">
                        <BackgroundControls
                            state={state}
                            setBgMode={setBgMode}
                            setBgImageFromFile={setBgImageFromFile}
                            setBgVideoFromFile={setBgVideoFromFile}
                            setBgColor={setBgColor}
                            setLineColor={setLineColor}
                        />

                        <BackgroundPreview state={state} />
                    </div>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
                <AvatarPicker />

                <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
                    <div className="text-[14px] font-semibold text-white">Sound</div>
                    <input
                        id="settingsSoundRange"
                        type="range"
                        min={0}
                        max={100}
                        step={12.5}
                        value={Math.round((state.soundVolume || 0) * 100)}
                        className={
                            "w-[160px] h-[6px] rounded-full outline-none appearance-none " +
                            "bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.20)_40%,rgba(255,255,255,0.35)_100%)] " +
                            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full " +
                            "[&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black/70 [&::-webkit-slider-thumb]:mt-[-6px] " +
                            "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#f2f2f2] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black/70 " +
                            "[&::-moz-range-track]:h-[6px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.20)_40%,rgba(255,255,255,0.35)_100%)]"
                        }
                        onChange={(e) => {
                            const n = Number(e.target.value || "0");
                            const clamped = Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
                            const v = clamped / 100;
                            setSoundVolume(v);
                            playSoundPreview(v);
                        }}
                    />
                </div>

                <ToggleRow id="settingsSnowToggle" label="Snow" pressed={state.snow} onToggle={() => setSnow(!state.snow)} />
                <ToggleRow id="settingsRgbToggle" label="RGB lines" pressed={state.rgb} onToggle={() => setRgb(!state.rgb)} />

                <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
                    <div className="text-[14px] font-semibold text-white">Default WS</div>
                    <WsServerSelect
                        setWsHost={setWsHost}
                        wsSelectValue={wsSelectValue}
                        wsWrapRef={wsWrapRef}
                        wsBtnRef={wsBtnRef}
                        wsMenuRef={wsMenuRef}
                        wsOpen={wsOpen}
                        setWsOpen={setWsOpen}
                        wsMenuPos={wsMenuPos}
                    />
                </div>
            </div>
        </div>
    );
}
