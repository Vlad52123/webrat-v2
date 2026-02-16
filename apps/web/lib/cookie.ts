export function getCookie(name: string): string {
    if (typeof document === "undefined") return "";
    const parts = String(document.cookie || "").split(";");
    for (const p of parts) {
        const kv = p.trim();
        if (!kv) continue;
        const eq = kv.indexOf("=");
        const k = eq >= 0 ? kv.slice(0, eq) : kv;
        if (k === name) return eq >= 0 ? decodeURIComponent(kv.slice(eq + 1)) : "";
    }
    return "";
}
