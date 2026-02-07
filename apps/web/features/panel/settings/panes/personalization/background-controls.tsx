"use client";

import type { BgMode } from "../../background";
import type { SettingsState } from "../../provider";

export function BackgroundControls(props: {
   state: SettingsState;
   setBgMode: (mode: BgMode) => void;
   setBgImageFromFile: (file: File) => Promise<void>;
   setBgVideoFromFile: (file: File) => Promise<void>;
   setBgColor: (color: string) => void;
   setLineColor: (color: string) => void;
   setSoundVolume: (v: number) => void;
   playSoundPreview: (v: number) => void;
}) {
   const { state, setBgMode, setBgImageFromFile, setBgVideoFromFile, setBgColor, setLineColor, setSoundVolume, playSoundPreview } = props;

   return (
      <div className="p-[14px] rounded-[14px] border border-white/[0.12] shadow-[0_18px_54px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] bg-[radial-gradient(520px_180px_at_15%_0%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_62%),linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]">
         <div className="ml-[2px] mt-[2px] mb-[10px] text-[17px] font-semibold text-white">Background</div>

         <div className="mt-[10px] mb-[14px] grid grid-cols-3 overflow-hidden rounded-[14px] border border-white/[0.18] bg-[rgba(0,0,0,0.25)]">
            <button
               id="settingsBgGalleryBtn"
               type="button"
               className={
                  "flex h-[40px] cursor-pointer items-center justify-center border-r border-white/[0.22] transition-colors " +
                  (state.bgMode === "image" ? "bg-white/[0.16]" : "bg-[rgba(35,35,35,0.4)] hover:bg-white/[0.10]")
               }
               aria-pressed={state.bgMode === "image"}
               onClick={() => {
                  if (!state.bgImage) {
                     try {
                        document.getElementById("settingsBgFile")?.click();
                     } catch {
                        return;
                     }
                     return;
                  }
                  setBgMode("image");
               }}
            >
               <img
                  src="/icons/gallery.svg"
                  alt="image"
                  draggable={false}
                  className="h-[20px] w-[20px] opacity-100 invert brightness-[1.7] contrast-[1.1]"
               />
            </button>
            <button
               id="settingsBgVideoBtn"
               type="button"
               className={
                  "flex h-[40px] cursor-pointer items-center justify-center border-r border-white/[0.22] transition-colors " +
                  (state.bgMode === "video" ? "bg-white/[0.16]" : "bg-[rgba(35,35,35,0.4)] hover:bg-white/[0.10]")
               }
               aria-pressed={state.bgMode === "video"}
               onClick={() => {
                  if (state.bgMode === "video" && state.bgVideoMarker) return;
                  if (!state.bgVideoMarker) {
                     try {
                        document.getElementById("settingsBgVideoFile")?.click();
                     } catch {
                        return;
                     }
                     return;
                  }
                  setBgMode("video");
               }}
            >
               <img
                  src="/icons/video.svg"
                  alt="video"
                  draggable={false}
                  className="h-[20px] w-[20px] opacity-100 invert brightness-[1.7] contrast-[1.1]"
               />
            </button>
            <button
               id="settingsBgDefaultBtn"
               type="button"
               className={
                  "flex h-[40px] cursor-pointer items-center justify-center transition-colors " +
                  (state.bgMode === "default" ? "bg-white/[0.16]" : "bg-[rgba(35,35,35,0.4)] hover:bg-white/[0.10]")
               }
               aria-pressed={state.bgMode === "default"}
               onClick={() => setBgMode("default")}
            >
               <img
                  src="/icons/default.svg"
                  alt="solid"
                  draggable={false}
                  className="h-[20px] w-[20px] opacity-100 invert brightness-[1.7] contrast-[1.1]"
               />
            </button>
         </div>

         <div className="grid gap-2">
            <input
               id="settingsBgFile"
               type="file"
               accept="image/*"
               className="hidden"
               onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (!file) {
                     if (state.bgMode === "image" && !state.bgImage) {
                        setBgMode("default");
                     }
                     return;
                  }
                  void setBgImageFromFile(file);
                  try {
                     e.target.value = "";
                  } catch {
                     return;
                  }
               }}
            />
         </div>

         <div className="grid gap-2">
            <input
               id="settingsBgVideoFile"
               type="file"
               accept="video/mp4,video/webm"
               className="hidden"
               onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (!file) {
                     if (state.bgMode === "video" && !state.bgVideoMarker) {
                        setBgMode("default");
                     }
                     return;
                  }
                  void setBgVideoFromFile(file);
                  try {
                     e.target.value = "";
                  } catch {
                     return;
                  }
               }}
            />
         </div>

         <div className="grid gap-2">
            <input
               id="settingsBgColor"
               type="color"
               value={state.bgColor || "#222222"}
               className="hidden"
               onChange={(e) => {
                  setBgMode("default");
                  setBgColor(e.target.value);
               }}
            />
         </div>

         <div className="my-[10px] rounded-[12px] border border-white/[0.12] bg-[rgba(0,0,0,0.35)] p-[10px]">
            <div className="flex items-center justify-between gap-3">
               <div className="text-[14px] font-semibold text-white">Line</div>
               <button
                  id="settingsLinePicker"
                  type="button"
                  className="flex items-center justify-center bg-transparent px-[10px] py-[6px] cursor-pointer"
                  onClick={() => {
                     try {
                        document.getElementById("settingsLineColor")?.click();
                     } catch {
                        return;
                     }
                  }}
               >
                  <span
                     id="settingsLinePreview"
                     className="h-[16px] w-[200px] rounded-[10px] border border-white/[0.16] cursor-pointer"
                     style={{ background: "var(--line)" }}
                  />
               </button>
               <input
                  id="settingsLineColor"
                  type="color"
                  value={state.lineColor || "#b4b4b4"}
                  className="hidden"
                  onChange={(e) => setLineColor(e.target.value)}
               />
            </div>
         </div>

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
      </div>
   );
}
