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
    <div id="settingsView" className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-[min(980px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
        <div className="rounded-[18px] border border-white/15 bg-black/30 px-[10px] pb-[10px] pt-0 shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-md">
          <div
            className="mt-[2px] mb-3 ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/95"
            aria-hidden={tab !== "personalization"}
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            Personalization
          </div>
          <div
            className="mt-[2px] mb-3 ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/95"
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
              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Background</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                  <div className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        id="settingsBgGalleryBtn"
                        type="button"
                        className={
                          "grid h-[32px] w-[46px] place-items-center rounded-[12px] border bg-black/30 hover:bg-white/10 " +
                          (state.bgMode === "image" ? "border-white/80" : "border-white/15")
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
                        <img src="/icons/gallery.svg" alt="image" draggable={false} className="h-[16px] w-[16px] opacity-90" />
                      </button>
                      <button
                        id="settingsBgVideoBtn"
                        type="button"
                        className={
                          "grid h-[32px] w-[46px] place-items-center rounded-[12px] border bg-black/30 hover:bg-white/10 " +
                          (state.bgMode === "video" ? "border-white/80" : "border-white/15")
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
                        <img src="/icons/video.svg" alt="video" draggable={false} className="h-[16px] w-[16px] opacity-90" />
                      </button>
                      <button
                        id="settingsBgDefaultBtn"
                        type="button"
                        className={
                          "grid h-[32px] w-[46px] place-items-center rounded-[12px] border bg-black/30 hover:bg-white/10 " +
                          (state.bgMode === "default" ? "border-white/80" : "border-white/15")
                        }
                        aria-pressed={state.bgMode === "default"}
                        onClick={() => setBgMode("default")}
                      >
                        <img src="/icons/default.svg" alt="solid" draggable={false} className="h-[16px] w-[16px] opacity-90" />
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
                  </div>

                  <div className="rounded-[14px] border border-white/10 bg-black/30 p-3">
                    <div className="mb-2 text-[12px] font-semibold text-white/70">Preview</div>
                    <div
                      id="settingsBgPreview"
                      className="h-[180px] w-full cursor-pointer rounded-[12px] border border-white/10 bg-[#121212]"
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

              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">UI</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-[12px] font-semibold text-white/70">Line color</label>
                    <div className="flex items-center gap-3">
                      <button
                        id="settingsLinePicker"
                        type="button"
                        className="rounded-[12px] border border-white/15 bg-black/30 px-3 py-2 hover:bg-white/10"
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
                          className="block h-[16px] w-[200px] rounded-[10px] border border-white/15"
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

                  <div className="grid gap-2">
                    <label className="text-[12px] font-semibold text-white/70">Sound</label>
                    <input
                      id="settingsSoundRange"
                      type="range"
                      min={0}
                      max={100}
                      step={12.5}
                      value={Math.round((state.soundVolume || 0) * 100)}
                      className="w-full"
                      onChange={(e) => {
                        const n = Number(e.target.value || "0");
                        const clamped = Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
                        setSoundVolume(clamped / 100);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="text-[13px] font-bold text-white/85">Snow</div>
                    <button
                      id="settingsSnowToggle"
                      type="button"
                      className={
                        "relative inline-flex h-[26px] w-[46px] items-center rounded-full border border-white/40 bg-[#282828]/90 transition-colors " +
                        (state.snow ? "justify-end bg-gradient-to-br from-[#40d67a] to-[#2abf5a] border-black/60" : "justify-start")
                      }
                      aria-pressed={state.snow}
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

                  <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="text-[13px] font-bold text-white/85">RGB lines</div>
                    <button
                      id="settingsRgbToggle"
                      type="button"
                      className={
                        "relative inline-flex h-[26px] w-[46px] items-center rounded-full border border-white/40 bg-[#282828]/90 transition-colors " +
                        (state.rgb ? "justify-end bg-gradient-to-br from-[#40d67a] to-[#2abf5a] border-black/60" : "justify-start")
                      }
                      aria-pressed={state.rgb}
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

                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="text-[13px] font-bold text-white/85">Default WS server</div>
                    <select
                      id="settingsWsServer"
                      className="h-[34px] min-w-[220px] cursor-pointer rounded-[12px] border border-white/15 bg-black/30 px-[10px] text-[13px] text-white/90 outline-none hover:bg-white/5"
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
              </div>
            </div>
          </div>

          <div
            className="min-h-[220px]"
            data-settings-pane="security"
            style={{ display: tab === "security" ? "block" : "none" }}
          >
            <div className="grid gap-4">
              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Account</div>
                <div className="grid gap-2 text-[13px] text-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Login</div>
                    <div id="securityLoginValue" className="font-bold text-white/90">
                      {securityLogin}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Registration</div>
                    <div id="securityRegDateValue" className="font-bold text-white/90">
                      -
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Subscription</div>
                    <div id="securitySubValue" className="font-bold text-white/90">
                      -
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Actions</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="securityLogoutBtn"
                    type="button"
                    className="rounded-[14px] border border-white/15 bg-black/30 px-4 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
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
                    Logout
                  </button>
                  <button
                    id="securityDeleteBtn"
                    type="button"
                    className="rounded-[14px] border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] font-bold text-red-100 hover:bg-red-500/15"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}