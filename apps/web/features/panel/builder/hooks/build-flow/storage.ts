import type { ActiveBuildState, BuildHistoryItem } from "./types";

function getBuildsKey(login: string): string {
    const safe = String(login || "").trim();
    if (!safe) return "webrat_builds";
    return "webrat_builds_" + safe;
}

function getActiveBuildKey(login: string): string {
    const safe = String(login || "").trim();
    if (!safe) return "webrat_active_build";
    return "webrat_active_build_" + safe;
}

export function processedJobKey(login: string, jobId: string): string {
    const safeLogin = String(login || "").trim() || "_";
    const safeJob = String(jobId || "").trim() || "_";
    return `webrat_processed_job_${safeLogin}_${safeJob}`;
}

export function dedupeHistoryByBuildId(items: BuildHistoryItem[]): BuildHistoryItem[] {
    const seen = new Set<string>();
    const out: BuildHistoryItem[] = [];
    for (const it of items) {
        const bid = String(it?.id || "").trim();
        if (!bid) continue;
        if (seen.has(bid)) continue;
        seen.add(bid);
        out.push(it);
    }
    return out;
}

export function loadActiveBuild(login: string): ActiveBuildState | null {
    const key = getActiveBuildKey(login);
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<ActiveBuildState>;
        const jobId = String(parsed?.jobId || "").trim();
        const name = String(parsed?.name || "").trim();
        const buildId = String(parsed?.buildId || "").trim();
        const password = String(parsed?.password || "").trim();
        const created = String(parsed?.created || "").trim();
        if (!jobId || !name || !buildId || !password) return null;
        return { jobId, name, buildId, password, created };
    } catch {
        return null;
    }
}

export function saveActiveBuild(login: string, st: ActiveBuildState) {
    const key = getActiveBuildKey(login);
    try {
        localStorage.setItem(key, JSON.stringify(st));
    } catch {
    }
}

export function clearActiveBuild(login: string) {
    const key = getActiveBuildKey(login);
    try {
        localStorage.removeItem(key);
    } catch {
    }
}

export function loadBuildsHistory(login: string): BuildHistoryItem[] {
    const key = getBuildsKey(login);
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed as BuildHistoryItem[];
    } catch {
        return [];
    }
}

export function saveBuildsHistory(login: string, items: BuildHistoryItem[]) {
    const key = getBuildsKey(login);
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch {
    }
    try {
        window.dispatchEvent(new CustomEvent("webrat_builds_updated", { detail: { key } }));
    } catch {
    }
}
