function getLastBuildKey(login: string): string {
   const safe = String(login || "").trim();
   if (!safe) return "webrat_last_build_ts";
   return "webrat_last_build_ts_" + safe;
}

export function getLastBuildTimestamp(login: string): number {
   const key = getLastBuildKey(login);
   try {
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? n : 0;
   } catch {
      return 0;
   }
}

export function setLastBuildTimestamp(login: string, ts: number) {
   const key = getLastBuildKey(login);
   try {
      localStorage.setItem(key, String(ts));
   } catch {
   }
}