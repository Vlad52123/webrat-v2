"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePanelSettings } from "../settings";
import { makeBgVideoDb } from "../settings/bg-video-db";
import { STORAGE_KEYS, prefKey, removePref } from "../settings/storage";
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
    reapply,
  } = usePanelSettings();

  const [securityLogin, setSecurityLogin] = useState("-");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordNewAgain, setPasswordNewAgain] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailNew, setEmailNew] = useState("");
  const [emailPasswordOrCode, setEmailPasswordOrCode] = useState("");
  const [emailStep, setEmailStep] = useState<"input" | "code">("input");
  const [pendingEmail, setPendingEmail] = useState("");

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

  const wsWrapRef = useRef<HTMLDivElement | null>(null);
  const wsBtnRef = useRef<HTMLButtonElement | null>(null);
  const [wsOpen, setWsOpen] = useState(false);
  const [wsMenuPos, setWsMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const reapplyRef = useRef(reapply);
  useEffect(() => {
    reapplyRef.current = reapply;
  }, [reapply]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      void reapplyRef.current();
    });
    return () => window.cancelAnimationFrame(id);
  }, [tab]);

  useEffect(() => {
    if (!wsOpen) return;

    const calcPos = () => {
      const btn = wsBtnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setWsMenuPos({ left: r.left, top: r.bottom + 8, width: Math.max(220, r.width) });
    };

    calcPos();

    const onDocDown = (e: MouseEvent) => {
      const wrap = wsWrapRef.current;
      if (!wrap) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (!wrap.contains(t)) setWsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWsOpen(false);
    };

    window.addEventListener("resize", calcPos);
    window.addEventListener("scroll", calcPos, true);
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", calcPos);
      window.removeEventListener("scroll", calcPos, true);
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [wsOpen]);

  useEffect(() => {
    if (!logoutOpen && !deleteOpen && !passwordOpen && !emailOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLogoutOpen(false);
        setDeleteOpen(false);
        setPasswordOpen(false);
        setEmailOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deleteOpen, emailOpen, logoutOpen, passwordOpen]);

  const wipeClientState = async () => {
    try {
      try {
        sessionStorage.clear();
      } catch {
      }
      try {
        localStorage.removeItem("webrat_login");
        localStorage.removeItem("webrat_reg_date");
      } catch {
      }
      try {
        Object.values(STORAGE_KEYS).forEach((k) => {
          try {
            removePref(String(k));
          } catch {
          }
          try {
            localStorage.removeItem(String(k));
          } catch {
          }
        });
      } catch {
      }
      try {
        const db = makeBgVideoDb(prefKey("bgVideo"));
        await db.del();
      } catch {
      }
    } catch {
    }
  };

  return (
    <div id="settingsView" className="flex h-full flex-col overflow-auto">
      <div className="flex-1 min-h-0 p-[10px]">
        <div className="w-[920px] max-w-[min(980px,calc(100vw-60px))] mx-auto mt-[22px] px-[10px] pb-[10px] min-h-[220px]">
          <div
            className="min-h-[220px]"
            data-settings-pane="personalization"
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            <div className="grid gap-5">
              <div className="overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px] min-h-[260px]">
                <div className="mb-[12px] ml-[2px] mt-[2px]">
                  <div className="text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]">Personalization</div>
                </div>
                <div className="grid grid-cols-1 gap-[16px] md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start">
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
                          "flex h-[40px] cursor-pointer items-center justify-center border-r border-white/[0.22] transition-colors " +
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
                          "relative inline-flex h-[26px] w-[46px] cursor-pointer items-center rounded-full border border-white/40 bg-[rgba(40,40,40,0.9)] transition-colors " +
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
                          "relative inline-flex h-[26px] w-[46px] cursor-pointer items-center rounded-full border border-white/40 bg-[rgba(40,40,40,0.9)] transition-colors " +
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
                      <div ref={wsWrapRef} className="relative min-w-[220px]">
                        <select
                          id="settingsWsServer"
                          className="absolute inset-0 opacity-0 pointer-events-none"
                          value={wsSelectValue}
                          onChange={(e) => setWsHost(e.target.value)}
                          aria-hidden
                          tabIndex={-1}
                        >
                          <option value="__default__">Default</option>
                          <option value="ru.webcrystal.sbs">Russia</option>
                          <option value="kz.webcrystal.sbs">Kazakhstan</option>
                          <option value="ua.webcrystal.sbs">Ukraine</option>
                        </select>

                        <button
                          ref={wsBtnRef}
                          type="button"
                          className={
                            "w-full h-[34px] px-[12px] pr-[32px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] text-[13px] text-white/[0.92] cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-[border-color,background,box-shadow,transform] " +
                            (wsOpen ? "border-white/[0.30] shadow-[0_0_0_3px_rgba(80,230,255,0.12)]" : "hover:bg-white/[0.06] hover:border-white/[0.22]")
                          }
                          onClick={() => setWsOpen((v) => !v)}
                        >
                          {wsSelectValue === "__default__"
                            ? "Default"
                            : wsSelectValue === "ru.webcrystal.sbs"
                              ? "Russia"
                              : wsSelectValue === "kz.webcrystal.sbs"
                                ? "Kazakhstan"
                                : wsSelectValue === "ua.webcrystal.sbs"
                                  ? "Ukraine"
                                  : wsSelectValue}
                          <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
                            <img
                              src="/icons/arrow.svg"
                              alt="v"
                              draggable={false}
                              className={"h-[10px] w-[10px] invert opacity-85 transition-transform " + (wsOpen ? "rotate-180" : "")}
                            />
                          </span>
                        </button>

                        {wsOpen && wsMenuPos ? (
                          <div
                            className="fixed z-[9999] rounded-[14px] border border-white/[0.14] bg-[rgba(12,12,12,0.96)] p-[8px] shadow-[0_22px_54px_rgba(0,0,0,0.65)]"
                            style={{ left: wsMenuPos.left, top: wsMenuPos.top, width: wsMenuPos.width }}
                            role="listbox"
                          >
                            {[
                              { value: "__default__", label: "Default" },
                              { value: "ru.webcrystal.sbs", label: "Russia" },
                              { value: "kz.webcrystal.sbs", label: "Kazakhstan" },
                              { value: "ua.webcrystal.sbs", label: "Ukraine" },
                            ].map((opt) => {
                              const selected = wsSelectValue === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  className={
                                    "w-full text-left px-[10px] py-[10px] rounded-[12px] font-semibold transition-[background,transform] cursor-pointer " +
                                    (selected
                                      ? "bg-[rgba(80,230,255,0.12)] border border-[rgba(80,230,255,0.20)]"
                                      : "bg-transparent hover:bg-white/[0.08]")
                                  }
                                  onClick={() => {
                                    setWsHost(opt.value);
                                    setWsOpen(false);
                                  }}
                                  role="option"
                                  aria-selected={selected}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
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
                <div className="text-[15px] font-medium text-white opacity-90">Login:</div>
                <div id="securityLoginValue" className="text-[14px] font-bold text-white/[0.92]">
                  {securityLogin}
                </div>
              </div>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <button
                id="securityPasswordRow"
                className={
                  "my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.18] px-[12px] py-[10px] text-left cursor-pointer " +
                  "bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] " +
                  "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_10px_22px_rgba(0,0,0,0.25)] transition-[background,border-color,transform,box-shadow] duration-150 " +
                  "hover:border-[rgba(235,200,255,0.40)] hover:translate-y-[-1px] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_14px_26px_rgba(0,0,0,0.30)] hover:bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_72%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]"
                }
                type="button"
                onClick={() => {
                  setPasswordOld("");
                  setPasswordNew("");
                  setPasswordNewAgain("");
                  setPasswordOpen(true);
                }}
              >
                <div className="text-[15px] font-medium text-white opacity-90">Password:</div>
                <div className="inline-flex items-center gap-[6px]">
                  <span id="securityPasswordValue" className="text-[14px] font-semibold text-white">
                    Change password
                  </span>
                  <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[16px] w-[16px] invert opacity-90" />
                </div>
              </button>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
                <div className="text-[15px] font-medium text-white opacity-90">Subscription:</div>
                <div id="securitySubValue" className="text-[14px] font-bold text-white/[0.92]">
                  NONE
                </div>
              </div>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <button
                id="securityMailRow"
                className={
                  "my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.18] px-[12px] py-[10px] text-left cursor-pointer " +
                  "bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] " +
                  "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_10px_22px_rgba(0,0,0,0.25)] transition-[background,border-color,transform,box-shadow] duration-150 " +
                  "hover:border-[rgba(235,200,255,0.40)] hover:translate-y-[-1px] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_14px_26px_rgba(0,0,0,0.30)] hover:bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_72%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]"
                }
                type="button"
                onClick={() => {
                  setEmailStep("input");
                  setPendingEmail("");
                  setEmailNew("");
                  setEmailPasswordOrCode("");
                  setEmailOpen(true);
                }}
              >
                <div className="text-[15px] font-medium text-white opacity-90">Your mail:</div>
                <div className="inline-flex items-center gap-[6px]">
                  <span id="securityMailValue" className="text-[14px] font-semibold text-white">
                    Not set
                  </span>
                  <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[16px] w-[16px] invert opacity-90" />
                </div>
              </button>

              <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
                <div className="text-[15px] font-medium text-white opacity-90">Registration date:</div>
                <div id="securityRegDateValue" className="text-[14px] font-bold text-white/[0.92]">
                  Unknown
                </div>
              </div>

              <div className="mt-[12px] h-px bg-[rgba(180,180,180,0.4)]" />

              <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
                <button
                  id="securityLogoutBtn"
                  className="h-[36px] rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] text-white font-semibold cursor-pointer transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]"
                  style={{ borderBottomColor: "var(--line)" }}
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                >
                  Log out
                </button>
                <button
                  id="securityDeleteBtn"
                  className="h-[36px] rounded-[12px] border border-[rgba(255,75,75,0.35)] border-b-[4px] bg-[rgba(255,75,75,0.10)] text-[#ff7070] font-semibold cursor-pointer transition-[background,border-color,transform] hover:bg-[rgba(255,75,75,0.16)] hover:border-[rgba(255,75,75,0.45)] active:translate-y-[1px]"
                  style={{ borderBottomColor: "rgba(255,75,75,0.95)" }}
                  type="button"
                  onClick={() => {
                    setDeleteErr("");
                    setDeletePwd("");
                    setDeleteOpen(true);
                  }}
                >
                  Delete acc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="logoutModalBackdrop"
        className={
          "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px] " +
          (logoutOpen ? "flex" : "hidden")
        }
        aria-hidden={!logoutOpen}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setLogoutOpen(false);
        }}
      >
        <div
          className="w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logoutModalTitle"
        >
          <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
            <div id="logoutModalTitle" className="text-[15px] font-bold text-white">
              Logout?
            </div>
            <button
              id="logoutModalClose"
              className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
              type="button"
              aria-label="Close"
              onClick={() => setLogoutOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="grid place-items-center gap-[12px] p-[18px]">
            <div className="flex justify-center">
              <button
                id="logoutModalLogout"
                className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={async () => {
                  try {
                    await wipeClientState();
                  } catch {
                  }
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
            </div>
          </div>
        </div>
      </div>

      <div
        id="deleteModalBackdrop"
        className={
          "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px] " +
          (deleteOpen ? "flex" : "hidden")
        }
        aria-hidden={!deleteOpen}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setDeleteOpen(false);
        }}
      >
        <div
          className="w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
        >
          <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
            <div id="deleteModalTitle" className="text-[15px] font-bold text-white">
              Delete account
            </div>
            <button
              id="deleteModalClose"
              className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
              type="button"
              aria-label="Close"
              onClick={() => setDeleteOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="grid gap-[12px] p-[18px] text-center">
            <div className="mb-[6px] text-[18px] font-black tracking-[0.08em] text-[#ff5555] [text-shadow:0_0_4px_#ff5555]">
              WARNING
            </div>
            <div className="text-[13px] font-semibold text-white/[0.82]">This action is irreversible.</div>
            <div className="text-[13px] font-semibold text-white/[0.82]">Your username and subscription may be lost.</div>

            <div className="grid gap-[4px]">
              <input
                id="deleteModalPassword"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="password"
                placeholder="Password"
                value={deletePwd}
                onChange={(e) => {
                  setDeletePwd(e.target.value);
                  setDeleteErr("");
                }}
              />
              {deleteErr ? <div className="text-[12px] font-semibold text-[#ff7070]">{deleteErr}</div> : null}
            </div>

            <div className="mt-[10px] flex justify-center">
              <button
                id="deleteModalConfirm"
                className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={async () => {
                  const pwd = String(deletePwd || "").trim();
                  if (!pwd) {
                    setDeleteErr("Enter password");
                    return;
                  }
                  try {
                    const res = await fetch(`/api/delete-account`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password: pwd }),
                    });
                    if (res.ok) {
                      await wipeClientState();
                      setDeleteOpen(false);
                      if (typeof window !== "undefined") {
                        window.location.replace("/login");
                      }
                      return;
                    }
                    if (res.status === 401) {
                      setDeleteErr("Password is incorrect");
                      return;
                    }
                    setDeleteErr("Delete account failed");
                  } catch {
                    setDeleteErr("Delete account failed");
                  }
                }}
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="passwordModalBackdrop"
        className={
          "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px] " +
          (passwordOpen ? "flex" : "hidden")
        }
        aria-hidden={!passwordOpen}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setPasswordOpen(false);
        }}
      >
        <div
          className="w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="passwordModalTitle"
        >
          <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
            <div id="passwordModalTitle" className="text-[15px] font-bold text-white">
              Change password
            </div>
            <button
              id="passwordModalClose"
              className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
              type="button"
              aria-label="Close"
              onClick={() => setPasswordOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="grid gap-[12px] p-[18px]">
            <div className="grid gap-[4px]">
              <input
                id="passwordOldInput"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="password"
                autoComplete="current-password"
                placeholder="Old password"
                value={passwordOld}
                onChange={(e) => setPasswordOld(e.target.value)}
              />
            </div>
            <div className="grid gap-[4px]">
              <input
                id="passwordNewInput"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                value={passwordNew}
                onChange={(e) => setPasswordNew(e.target.value)}
              />
            </div>
            <div className="grid gap-[4px]">
              <input
                id="passwordNewAgainInput"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="password"
                autoComplete="new-password"
                placeholder="New password again"
                value={passwordNewAgain}
                onChange={(e) => setPasswordNewAgain(e.target.value)}
              />
            </div>

            <div className="mt-[8px] flex justify-center">
              <button
                id="passwordModalConfirm"
                className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={async () => {
                  const oldPwd = String(passwordOld || "");
                  const newPwd = String(passwordNew || "");
                  const newAgain = String(passwordNewAgain || "");
                  if (!oldPwd || !newPwd || !newAgain) {
                    try {
                      window.WebRatCommon?.showToast?.("error", "Fill all fields");
                    } catch {
                    }
                    return;
                  }
                  if (newPwd !== newAgain) {
                    try {
                      window.WebRatCommon?.showToast?.("error", "New passwords do not match");
                    } catch {
                    }
                    return;
                  }

                  try {
                    const res = await fetch(`/api/change-password`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ old_password: oldPwd, new_password: newPwd }),
                    });
                    if (res.ok) {
                      try {
                        window.WebRatCommon?.showToast?.("success", "Password changed");
                      } catch {
                      }
                      setPasswordOpen(false);
                      return;
                    }
                    if (res.status === 409) {
                      window.WebRatCommon?.showToast?.("error", "You cannot change password to the one you already have");
                      return;
                    }
                    if (res.status === 401) {
                      window.WebRatCommon?.showToast?.("error", "Old password is incorrect");
                      return;
                    }
                    window.WebRatCommon?.showToast?.("error", "Password change failed");
                  } catch {
                    try {
                      window.WebRatCommon?.showToast?.("error", "Password change failed");
                    } catch {
                    }
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="emailModalBackdrop"
        className={
          "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px] " +
          (emailOpen ? "flex" : "hidden")
        }
        aria-hidden={!emailOpen}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setEmailOpen(false);
        }}
      >
        <div
          className="w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emailModalTitle"
        >
          <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
            <div id="emailModalTitle" className="text-[15px] font-bold text-white">
              Set email
            </div>
            <button
              id="emailModalClose"
              className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
              type="button"
              aria-label="Close"
              onClick={() => setEmailOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="grid gap-[12px] p-[18px]">
            <div className="grid gap-[4px]">
              <input
                id="emailNewInput"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="email"
                placeholder="New mail"
                value={emailNew}
                onChange={(e) => setEmailNew(e.target.value)}
                disabled={emailStep === "code"}
              />
            </div>
            <div className="grid gap-[4px]">
              <input
                id="emailPasswordInput"
                className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="password"
                placeholder={emailStep === "code" ? "Code" : "Password"}
                value={emailPasswordOrCode}
                onChange={(e) => setEmailPasswordOrCode(e.target.value)}
                maxLength={emailStep === "code" ? 8 : undefined}
              />
            </div>

            <div className="mt-[8px] flex justify-center">
              <button
                id="emailModalConfirm"
                className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={async () => {
                  const email = String(emailNew || "").trim();
                  const value = String(emailPasswordOrCode || "").trim();

                  if (emailStep === "input") {
                    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                    if (!email || !emailRe.test(email)) {
                      window.WebRatCommon?.showToast?.("error", "Invalid email address");
                      return;
                    }
                    if (!value) {
                      window.WebRatCommon?.showToast?.("error", "Enter account password");
                      return;
                    }

                    try {
                      const res = await fetch(`/api/set-email`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password: value }),
                      });

                      if (res.status === 401) {
                        window.WebRatCommon?.showToast?.("error", "Password is incorrect");
                        return;
                      }
                      if (!res.ok) {
                        window.WebRatCommon?.showToast?.("error", "Failed to send verification code");
                        return;
                      }

                      setPendingEmail(email);
                      setEmailStep("code");
                      setEmailPasswordOrCode("");
                      window.WebRatCommon?.showToast?.("success", "Code sent to your email");
                    } catch {
                      window.WebRatCommon?.showToast?.("error", "Failed to send verification code");
                    }

                    return;
                  }

                  if (!value) {
                    window.WebRatCommon?.showToast?.("error", "Enter code from email");
                    return;
                  }

                  try {
                    const res = await fetch(`/api/confirm-email`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: value }),
                    });

                    if (res.status === 400) {
                      window.WebRatCommon?.showToast?.("error", "Invalid verification code");
                      return;
                    }
                    if (!res.ok) {
                      window.WebRatCommon?.showToast?.("error", "Email verification failed");
                      return;
                    }

                    if (pendingEmail) {
                      try {
                        const el = document.getElementById("securityMailValue");
                        if (el) el.textContent = pendingEmail;
                      } catch {
                      }
                    }
                    setEmailOpen(false);
                    window.WebRatCommon?.showToast?.("success", "Email verified");
                  } catch {
                    window.WebRatCommon?.showToast?.("error", "Email verification failed");
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}