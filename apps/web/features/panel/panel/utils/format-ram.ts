export function formatRam(raw: string | undefined | null): string {
    const s = String(raw ?? "").trim();
    if (!s) return "";

    const num = parseInt(s, 10);
    if (!Number.isFinite(num) || num <= 0) return s;

    if (num > 1_000_000_000) {
        const gb = (num / (1024 * 1024 * 1024)).toFixed(1);
        return gb.endsWith(".0") ? gb.slice(0, -2) + " GB" : gb + " GB";
    }

    if (num > 1_000_000) {
        return (num / (1024 * 1024)).toFixed(0) + " MB";
    }

    return s;
}
