"use client";

import { useEffect, useMemo, useState } from "react";

import { usePanelSettings } from "../settings";
import type { SettingsTabKey } from "../state/settings-tab";

export function SettingsScreen(props: { tab: SettingsTabKey }) {
  const { tab } = props;
  const {
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
  } = usePanelSettings();

  const [securityLogin, setSecurityLogin] = useState("-");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/me`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as unknown;
        if (cancelled) return;
        const login = (() => {
          if (typeof data !== "object" || !data) return "-";
          const user = (data as { user?: unknown }).user;
          if (typeof user !== "object" || !user) return "-";
          const l = (user as { login?: unknown }).login;
          return typeof l === "string" && l ? l : "-";
        })();
        setSecurityLogin(login || "-");
      } catch {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wsSelectValue = useMemo(() => state.wsHost || "__default__", [state.wsHost]);

  return (
    <div id="settingsView" className="flex h-full flex-col overflow-auto">
      <div className="flex-1 min-h-0 p-[10px]">
        <div className="w-[920px] max-w-[min(980px,calc(100vw-60px))] mx-auto mt-[22px] px-[10px] pb-[10px] min-h-[220px]">
          <div
            className="mt-[2px] mb-[12px] ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]"
            aria-hidden={tab !== "personalization"}
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            Personalization
          </div>
          <div
            className="mt-[2px] mb-[12px] ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]"
            aria-hidden={tab !== "security"}
            style={{ display: tab === "security" ? "block" : "none" }}
          >
            Security
          </div>

          <div
            className="min-h-[220px]"
            data-settings-pane="personalization"
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            <div className="grid gap-5">
              <div className="overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px] min-h-[260px]">
                <div className="grid grid-cols-1 gap-[16px] md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start">
                  <div className="p-[14px] rounded-[14px] border border-white/[0.12] shadow-[0_18px_54px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] bg-[radial-gradient(520px_180px_at_15%_0%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_62%),linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)]">
                    <div className="ml-[2px] mt-[2px] mb-[10px] text-[17px] font-semibold text-white">Background</div>

                    <div className="mt-[10px] mb-[14px] grid grid-cols-3 overflow-hidden rounded-[14px] border border-white/[0.18] bg-[rgba(0,0,0,0.25)]">
                      <button
                        id="settingsBgGalleryBtn"
                        type="button"
                        className={
                          "flex h-[40px] items-center justify-center border-r border-white/[0.22] transition-colors " +
                          (state.bgMode === "image" ? "bg-white/[0.16]" : "bg-[rgba(35,35,35,0.4)] hover:bg-white/[0.10]")
                        }
                        aria-pressed={state.bgMode === "image"}
                        onClick={() => {
                          setBgMode("image");
                          if (!state.bgImage) {
                            try {
                              document.getElementById("settingsBgFile")?.click();
                            } catch {
                              return;
                            }
                          }
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
                          "flex h-[40px] items-center justify-center border-r border-white/[0.22] transition-colors " +
                          (state.bgMode === "video" ? "bg-white/[0.16]" : "bg-[rgba(35,35,35,0.4)] hover:bg-white/[0.10]")
                        }
                        aria-pressed={state.bgMode === "video"}
                        onClick={() => {
                          if (state.bgMode === "video" && state.bgVideoMarker) return;
                          setBgMode("video");
                          if (!state.bgVideoMarker) {
                            try {
                              document.getElementById("settingsBgVideoFile")?.click();
                            } catch {
                              return;
                            }
                          }
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
                          "flex h-[40px] items-center justify-center transition-colors " +
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
                          if (!file) return;
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
                          if (!file) return;
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
                          className="flex items-center justify-center bg-transparent px-[10px] py-[6px]"
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
                            className="h-[16px] w-[200px] rounded-[10px] border border-white/[0.16]"
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
                          setSoundVolume(clamped / 100);
                        }}
                      />
                    </div>

                    <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

                    <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
                      <div className="text-[14px] font-semibold text-white">Snow</div>
                      <button
                        id="settingsSnowToggle"
                        type="button"
                        aria-pressed={state.snow}
                        className={
                          "relative inline-flex h-[26px] w-[46px] items-center rounded-full border border-white/40 bg-[rgba(40,40,40,0.9)] transition-colors " +
                          (state.snow ? "justify-end bg-gradient-to-br from-[#40d67a] to-[#2abf5a] border-black/60" : "justify-start")
                        }
                        onClick={() => setSnow(!state.snow)}
                      >
                        <span
                          className={
                            "h-[20px] w-[20px] rounded-full bg-[#f5f5f5] shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform " +
                            (state.snow ? "translate-x-[-3px]" : "translate-x-[3px]")
                          }
                        />
                      </button>
                    </div>

                    <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
                      <div className="text-[14px] font-semibold text-white">RGB lines</div>
                      <button
                        id="settingsRgbToggle"
                        type="button"
                        aria-pressed={state.rgb}
                        className={
                          "relative inline-flex h-[26px] w-[46px] items-center rounded-full border border-white/40 bg-[rgba(40,40,40,0.9)] transition-colors " +
                          (state.rgb ? "justify-end bg-gradient-to-br from-[#40d67a] to-[#2abf5a] border-black/60" : "justify-start")
                        }
                        onClick={() => setRgb(!state.rgb)}
                      >
                        <span
                          className={
                            "h-[20px] w-[20px] rounded-full bg-[#f5f5f5] shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform " +
                            (state.rgb ? "translate-x-[-3px]" : "translate-x-[3px]")
                          }
                        />
                      </button>
                    </div>

                    <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
                      <div className="text-[14px] font-semibold text-white">Default WS server</div>
                      <select
                        id="settingsWsServer"
                        className="h-[34px] min-w-[220px] cursor-pointer rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[10px] text-[13px] text-white/[0.92] outline-none transition-[border-color,background,box-shadow] hover:bg-white/[0.06] hover:border-white/[0.22] focus:border-white/[0.30] focus:shadow-[0_0_0_3px_rgba(80,230,255,0.12)]"
                        value={wsSelectValue}
                        onChange={(e) => setWsHost(e.target.value)}
                      >
                        <option value="__default__">Default</option>
                        <option value="ru.webcrystal.sbs">Russia</option>
                        <option value="kz.webcrystal.sbs">Kazakhstan</option>
                        <option value="ua.webcrystal.sbs">Ukraine</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className="h-[220px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(12,12,12,0.5)] shadow-[0_18px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] md:h-[330px]"
                    aria-label="Background preview"
                  >
                    <div
                      id="settingsBgPreview"
                      className="h-full w-full cursor-pointer border border-white/[0.10] bg-[rgba(22,22,22,0.65)] bg-center bg-no-repeat [background-size:contain]"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (state.bgMode === "image") {
                          try {
                            document.getElementById("settingsBgFile")?.click();
                          } catch {
                            return;
                          }
                        }
                        if (state.bgMode === "video") {
                          try {
                            document.getElementById("settingsBgVideoFile")?.click();
                          } catch {
                            return;
                          }
                        }

                        if (state.bgMode === "default") {
                          try {
                            document.getElementById("settingsBgColor")?.click();
                          } catch {
                            return;
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="min-h-[220px]"
            data-settings-pane="security"
            style={{ display: tab === "security" ? "block" : "none" }}
          >
            <div className="overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[16px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px] min-h-[360px]">
              <div className="mb-[12px] ml-[2px] mt-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]">Security</div>

              <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
                <div className="text-[14px] font-semibold text-white opacity-90">Login:</div>
                <div id="securityLoginValue" className="text-[14px] font-semibold text-white/[0.92]">
                  {securityLogin}
                </div>
              </div>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <button
                id="securityPasswordRow"
                className="my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px] text-left"
                type="button"
              >
                <div className="text-[14px] font-semibold text-white opacity-90">Password:</div>
                <div className="flex items-center gap-2">
                  <span id="securityPasswordValue" className="text-[14px] font-semibold text-[rgb(240,105,236)]">
                    Change password
                  </span>
                  <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[14px] w-[14px] invert opacity-85" />
                </div>
              </button>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
                <div className="text-[14px] font-semibold text-white opacity-90">Subscription:</div>
                <div
                  id="securitySubValue"
                  className="text-[14px] font-semibold text-white/[0.92]"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  NONE
                </div>
              </div>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <button
                id="securityMailRow"
                className="my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px] text-left"
                type="button"
              >
                <div className="text-[14px] font-semibold text-white opacity-90">Your mail:</div>
                <div className="flex items-center gap-2">
                  <span id="securityMailValue" className="text-[14px] font-semibold text-[rgb(240,105,236)]">
                    Not set
                  </span>
                  <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[14px] w-[14px] invert opacity-85" />
                </div>
              </button>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
                <div className="text-[14px] font-semibold text-white opacity-90">Registration date:</div>
                <div id="securityRegDateValue" className="text-[14px] font-semibold text-white/[0.92]">
                  Unknown
                </div>
              </div>

              <div className="mt-[12px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="mt-[14px] flex flex-wrap gap-[10px]">
                <button
                  id="securityLogoutBtn"
                  className="min-w-[140px] rounded-[12px] border border-white/[0.18] bg-white/[0.10] px-[18px] py-[10px] text-[14px] font-semibold text-white hover:bg-white/[0.14] active:translate-y-[1px]"
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch(`/api/logout`, { method: "POST", credentials: "include" });
                    } catch {
                    }
                    if (typeof window !== "undefined") {
                      window.location.replace("/login");
                    }
                  }}
                >
                  Log out
                </button>
                <button
                  id="securityDeleteBtn"
                  className="min-w-[140px] rounded-[12px] border border-white/[0.18] bg-[rgba(120,0,0,0.25)] px-[18px] py-[10px] text-[14px] font-semibold text-white hover:bg-[rgba(160,0,0,0.25)] active:translate-y-[1px]"
                  type="button"
                >
                  Delete acc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}