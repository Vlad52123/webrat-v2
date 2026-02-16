export const STORAGE_KEYS = {
    bgImage: "webrat_ui_bg_image",
    bgVideo: "webrat_ui_bg_video",
    bgMode: "webrat_ui_bg_mode",
    bgColor: "webrat_ui_bg_color",
    lineColor: "webrat_ui_line_color",
    ignoredVictims: "webrat_ignored_victims",
    snow: "webrat_ui_snow",
    rgb: "webrat_ui_rgb_line",
    sound: "webrat_ui_sound_volume",
    wsHost: "webrat_ui_ws_host",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function getLoginKeyForPrefs(): string {
    try {
        return String(localStorage.getItem("webrat_login") || "")
            .trim()
            .replace(/[^A-Za-z0-9_-]/g, "")
            .slice(0, 32);
    } catch {
        return "";
    }
}

export function prefKey(baseKey: string): string {
    const b = String(baseKey || "");
    if (!b) return b;
    const lk = getLoginKeyForPrefs();
    return lk ? `${b}::${lk}` : b;
}

export function readLS(key: string): string {
    try {
        return String(localStorage.getItem(key) || "");
    } catch {
        return "";
    }
}

export function writeLS(key: string, value: string): void {
    try {
        localStorage.setItem(key, String(value ?? ""));
    } catch {
        return;
    }
}

export function removeLS(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        return;
    }
}

export function migratePrefKey(baseKey: string): void {
    const lk = getLoginKeyForPrefs();
    if (!lk) return;

    try {
        const legacyVal = localStorage.getItem(String(baseKey));
        const nk = prefKey(baseKey);
        const hasNk = localStorage.getItem(nk) != null;
        if (!hasNk && legacyVal != null && String(legacyVal) !== "") {
            localStorage.setItem(nk, String(legacyVal));
        }
        if (legacyVal != null) {
            try {
                localStorage.removeItem(String(baseKey));
            } catch {
                return;
            }
        }
    } catch {
        return;
    }
}

export function readPref(baseKey: string): string {
    return readLS(prefKey(baseKey));
}

export function writePref(baseKey: string, value: string): void {
    writeLS(prefKey(baseKey), value);
}

export function removePref(baseKey: string): void {
    removeLS(prefKey(baseKey));
}

export function normalizeWsHost(v: string): string {
    const s = String(v || "").trim();
    if (!s) return "";
    if (s === "__default__" || s === "default") return "";
    const host = s
        .replace(/^wss?:\/\//i, "")
        .replace(/\/$/, "")
        .replace(/\/ws$/i, "")
        .trim();

    const ok = /^[A-Za-z0-9.:-]+$/.test(host);
    return ok ? host : "";
}

export function readWsHostGlobal(): string {
    const raw = readLS(prefKey(STORAGE_KEYS.wsHost));
    return normalizeWsHost(raw);
}

export function writeWsHostGlobal(host: string): void {
    const v = normalizeWsHost(String(host || "").trim());
    writeLS(prefKey(STORAGE_KEYS.wsHost), v);
    removeLS(String(STORAGE_KEYS.wsHost));
    try {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("webrat_ws_host_changed", { detail: { host: v } }));
        }
    } catch {
    }
}

export function migrateLegacyWsHostGlobal(): void {
    try {
        const scopedKey = prefKey(STORAGE_KEYS.wsHost);
        if (!scopedKey || scopedKey === String(STORAGE_KEYS.wsHost)) return;

        const current = normalizeWsHost(localStorage.getItem(scopedKey) || "");
        if (current) {
            try {
                localStorage.removeItem(String(STORAGE_KEYS.wsHost));
            } catch {
                return;
            }
            return;
        }

        const legacy = normalizeWsHost(localStorage.getItem(String(STORAGE_KEYS.wsHost)) || "");
        if (legacy) {
            try {
                localStorage.setItem(scopedKey, legacy);
            } catch {
                return;
            }
        }
        try {
            localStorage.removeItem(String(STORAGE_KEYS.wsHost));
        } catch {
            return;
        }
    } catch {
        return;
    }
}
