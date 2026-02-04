"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePanelSettings } from "../settings";
import { ChangePasswordModal } from "../settings/modals/change-password-modal";
import { makeBgVideoDb } from "../settings/bg-video-db";
import { DeleteAccountModal } from "../settings/modals/delete-account-modal";
import { LogoutModal } from "../settings/modals/logout-modal";
import { SetEmailModal } from "../settings/modals/set-email-modal";
import { csrfHeaders } from "../builder/utils/csrf";
import { PersonalizationPane } from "../settings/panes/personalization-pane";
import { SecurityPane } from "../settings/panes/security-pane";
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
  const [securitySub, setSecuritySub] = useState("...");
  const [securitySubLoading, setSecuritySubLoading] = useState(true);
  const [securityEmail, setSecurityEmail] = useState("Not set");
  const [securityRegDate, setSecurityRegDate] = useState("Unknown");
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

  const formatDateTime = (iso: unknown): string => {
    if (!iso) return "Unknown";
    const d = new Date(String(iso));
    if (!Number.isFinite(d.getTime())) return "Unknown";
    try {
      return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/me/`, { method: "GET", credentials: "include" });
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setSecuritySubLoading(true);
        const res = await fetch(`/api/subscription/`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as unknown;
        if (cancelled) return;
        const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
        const status = String(obj?.status || "none").toLowerCase();
        setSecuritySub(status === "vip" ? "RATER" : "NONE");
      } catch {
        return;
      } finally {
        if (!cancelled) setSecuritySubLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/account/`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as unknown;
        if (cancelled) return;

        const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

        const email = String(obj?.email || "").trim();
        setSecurityEmail(email ? email : "Not set");

        setSecurityRegDate(formatDateTime(obj?.created_at));
      } catch {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wsSelectValue = useMemo(() => state.wsHost || "__default__", [state.wsHost]);

  const securitySubDisplay = useMemo(() => {
    return securitySubLoading ? "..." : securitySub;
  }, [securitySub, securitySubLoading]);

  const wsWrapRef = useRef<HTMLDivElement | null>(null);
  const wsBtnRef = useRef<HTMLButtonElement | null>(null);
  const wsMenuRef = useRef<HTMLDivElement | null>(null);
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
      const menu = wsMenuRef.current;
      if (!wrap) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (wrap.contains(t)) return;
      if (menu && menu.contains(t)) return;
      setWsOpen(false);
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
          <PersonalizationPane
            tab={tab}
            state={state}
            setBgMode={setBgMode}
            setBgImageFromFile={setBgImageFromFile}
            setBgVideoFromFile={setBgVideoFromFile}
            setBgColor={setBgColor}
            setLineColor={setLineColor}
            setSnow={setSnow}
            setRgb={setRgb}
            setSoundVolume={setSoundVolume}
            setWsHost={setWsHost}
            wsSelectValue={wsSelectValue}
            wsWrapRef={wsWrapRef}
            wsBtnRef={wsBtnRef}
            wsMenuRef={wsMenuRef}
            wsOpen={wsOpen}
            setWsOpen={setWsOpen}
            wsMenuPos={wsMenuPos}
          />

          <SecurityPane
            tab={tab}
            securityLogin={securityLogin}
            securitySub={securitySubDisplay}
            securityEmail={securityEmail}
            securityRegDate={securityRegDate}
            onOpenPassword={() => {
              setPasswordOld("");
              setPasswordNew("");
              setPasswordNewAgain("");
              setPasswordOpen(true);
            }}
            onOpenEmail={() => {
              setEmailStep("input");
              setPendingEmail("");
              setEmailNew("");
              setEmailPasswordOrCode("");
              setEmailOpen(true);
            }}
            onOpenLogout={() => setLogoutOpen(true)}
            onOpenDelete={() => {
              setDeleteErr("");
              setDeletePwd("");
              setDeleteOpen(true);
            }}
          />
        </div>
      </div>

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={() => {
          void (async () => {
            try {
              await wipeClientState();
            } catch {
            }
            try {
              await fetch(`/api/logout/`, { method: "POST", credentials: "include" });
            } catch {
            }
            if (typeof window !== "undefined") {
              window.location.replace("/login");
            }
          })();
        }}
      />

      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        password={deletePwd}
        setPassword={setDeletePwd}
        error={deleteErr}
        setError={setDeleteErr}
        onConfirm={(pwd) => {
          void (async () => {
            if (!pwd) {
              setDeleteErr("Enter password");
              return;
            }
            try {
              const res = await fetch(`/api/delete-account/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...csrfHeaders() },
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
          })();
        }}
      />

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        oldPassword={passwordOld}
        setOldPassword={setPasswordOld}
        newPassword={passwordNew}
        setNewPassword={setPasswordNew}
        newPasswordAgain={passwordNewAgain}
        setNewPasswordAgain={setPasswordNewAgain}
        onConfirm={() => {
          void (async () => {
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
              const res = await fetch(`/api/change-password/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...csrfHeaders() },
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
          })();
        }}
      />

      <SetEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        email={emailNew}
        setEmail={setEmailNew}
        passwordOrCode={emailPasswordOrCode}
        setPasswordOrCode={setEmailPasswordOrCode}
        step={emailStep}
        onConfirm={() => {
          void (async () => {
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
                const res = await fetch(`/api/set-email/`, {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json", ...csrfHeaders() },
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
              const res = await fetch(`/api/confirm-email/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...csrfHeaders() },
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
          })();
        }}
      />
    </div>
  );
}