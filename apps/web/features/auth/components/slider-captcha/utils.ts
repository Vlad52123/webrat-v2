export function getCookie(name: string): string {
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

export function clamp(v: number, min: number, max: number) {
   return Math.max(min, Math.min(max, v));
}