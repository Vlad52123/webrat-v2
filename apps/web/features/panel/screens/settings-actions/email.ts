import { csrfHeaders } from "../../builder/utils/csrf";

const LS_KEY = "wc_email_pending";

export type EmailPending = { email: string; expiresAt: number };

export function loadEmailPending(): EmailPending | null {
   try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as EmailPending;
      if (!parsed?.email || !parsed?.expiresAt) return null;
      if (Date.now() >= parsed.expiresAt) {
         localStorage.removeItem(LS_KEY);
         return null;
      }
      return parsed;
   } catch {
      return null;
   }
}

function saveEmailPending(email: string, expiresAt: number): void {
   try {
      localStorage.setItem(LS_KEY, JSON.stringify({ email, expiresAt }));
   } catch { }
}

export function clearEmailPending(): void {
   try {
      localStorage.removeItem(LS_KEY);
   } catch { }
}

type Params = {
   emailNew: string;
   emailPasswordOrCode: string;
   emailStep: "input" | "code";
   pendingEmail: string;
   setPendingEmail: (v: string) => void;
   setEmailStep: (v: "input" | "code") => void;
   setEmailPasswordOrCode: (v: string) => void;
   setEmailOpen: (v: boolean) => void;
   setExpiresAt: (v: number) => void;
   setSecurityEmail: (v: string) => void;
};

export async function setEmailConfirmAction(p: Params): Promise<void> {
   const {
      emailNew,
      emailPasswordOrCode,
      emailStep,
      pendingEmail,
      setPendingEmail,
      setEmailStep,
      setEmailPasswordOrCode,
      setEmailOpen,
      setExpiresAt,
      setSecurityEmail,
   } = p;

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

         let expiresAt = Date.now() + 5 * 60 * 1000;
         try {
            const data = (await res.json()) as { expires_at?: string };
            if (data.expires_at) {
               expiresAt = new Date(data.expires_at).getTime();
            }
         } catch { }

         saveEmailPending(email, expiresAt);
         setPendingEmail(email);
         setExpiresAt(expiresAt);
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

      clearEmailPending();
      const finalEmail = pendingEmail || email;
      setSecurityEmail(finalEmail);
      try {
         const el = document.getElementById("securityMailValue");
         if (el) el.textContent = finalEmail;
      } catch { }
      setEmailOpen(false);
      window.WebRatCommon?.showToast?.("success", "Email verified successfully");
   } catch {
      window.WebRatCommon?.showToast?.("error", "Email verification failed");
   }
}

export async function detachEmailAction(
   password: string,
   setSecurityEmail: (v: string) => void,
   onDone: () => void,
): Promise<void> {
   if (!password.trim()) {
      window.WebRatCommon?.showToast?.("error", "Enter account password");
      return;
   }

   try {
      const res = await fetch(`/api/detach-email/`, {
         method: "POST",
         credentials: "include",
         headers: { "Content-Type": "application/json", ...csrfHeaders() },
         body: JSON.stringify({ password: password.trim() }),
      });

      if (res.status === 401) {
         window.WebRatCommon?.showToast?.("error", "Password is incorrect");
         return;
      }
      if (!res.ok) {
         window.WebRatCommon?.showToast?.("error", "Failed to unbind email");
         return;
      }

      setSecurityEmail("Not set");
      try {
         const el = document.getElementById("securityMailValue");
         if (el) el.textContent = "Not set";
      } catch { }
      onDone();
      window.WebRatCommon?.showToast?.("success", "Email unlinked");
   } catch {
      window.WebRatCommon?.showToast?.("error", "Failed to unbind email");
   }
}

declare global {
   interface Window {
      WebRatCommon?: { showToast?: (type: string, message: string) => void };
   }
}