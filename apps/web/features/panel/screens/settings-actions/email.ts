import { csrfHeaders } from "../../builder/utils/csrf";

type Params = {
   emailNew: string;
   emailPasswordOrCode: string;
   emailStep: "input" | "code";
   pendingEmail: string;
   setPendingEmail: (v: string) => void;
   setEmailStep: (v: "input" | "code") => void;
   setEmailPasswordOrCode: (v: string) => void;
   setEmailOpen: (v: boolean) => void;
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
}

declare global {
   interface Window {
      WebRatCommon?: { showToast?: (type: string, message: string) => void };
   }
}