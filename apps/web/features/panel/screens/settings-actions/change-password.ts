import { csrfHeaders } from "../../builder/utils/csrf";

type Params = {
    passwordSaving: boolean;
    setPasswordSaving: (v: boolean) => void;
    passwordOld: string;
    passwordNew: string;
    passwordNewAgain: string;
    setPasswordOpen: (v: boolean) => void;
};

export async function changePasswordAction(p: Params): Promise<void> {
    const {
        passwordSaving,
        setPasswordSaving,
        passwordOld,
        passwordNew,
        passwordNewAgain,
        setPasswordOpen,
    } = p;

    if (passwordSaving) return;
    const oldPwd = String(passwordOld || "").trim();
    const newPwd = String(passwordNew || "").trim();
    const newAgain = String(passwordNewAgain || "").trim();
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

    const pwRe = /^[A-Za-z0-9_-]{6,24}$/;
    if (!pwRe.test(newPwd)) {
        try {
            window.WebRatCommon?.showToast?.(
                "error",
                "Invalid password. New password must be 6-24 chars and only A-Z a-z 0-9 _ -",
            );
        } catch {
        }
        return;
    }

    try {
        setPasswordSaving(true);
        const res = await fetch(`/api/change-password/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", ...csrfHeaders() },
            body: JSON.stringify({ old_password: oldPwd, new_password: newPwd }),
        });

        let responseText = "";
        try {
            responseText = await res.text();
        } catch {
            responseText = "";
        }

        const responseJson = (() => {
            const t = String(responseText || "").trim();
            if (!t) return null;
            try {
                return JSON.parse(t) as unknown;
            } catch {
                return null;
            }
        })();

        const responseError = (() => {
            if (!responseJson || typeof responseJson !== "object") return "";
            const e = (responseJson as { error?: unknown }).error;
            return typeof e === "string" ? e : "";
        })();

        if (res.ok && !responseError) {
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
            window.WebRatCommon?.showToast?.("error", "Old password is incorrect (or session expired)");
            return;
        }
        if (res.status === 400) {
            window.WebRatCommon?.showToast?.(
                "error",
                "Invalid password. New password must be 6-24 chars and only A-Z a-z 0-9 _ -",
            );
            return;
        }
        if (res.status === 403) {
            window.WebRatCommon?.showToast?.("error", "Request blocked");
            return;
        }
        if (res.status === 404) {
            window.WebRatCommon?.showToast?.("error", "API error: /api/change-password not found");
            return;
        }
        if (res.status === 429) {
            window.WebRatCommon?.showToast?.("error", "Too many requests, try later");
            return;
        }

        if (responseError) {
            window.WebRatCommon?.showToast?.("error", responseError);
            return;
        }

        window.WebRatCommon?.showToast?.("error", "Password change failed");
    } catch {
        try {
            window.WebRatCommon?.showToast?.("error", "Password change failed");
        } catch {
        }
    } finally {
        setPasswordSaving(false);
    }
}

declare global {
    interface Window {
        WebRatCommon?: { showToast?: (type: string, message: string) => void };
    }
}
