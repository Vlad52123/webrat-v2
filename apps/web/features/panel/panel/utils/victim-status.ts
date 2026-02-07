import type { Victim } from "../../api/victims";

export function getLastActiveMs(victim: Victim | null | undefined): number {
   if (!victim) return 0;

   const la = (victim as unknown as { last_active?: unknown }).last_active;

   if (typeof la === "number") {
      if (!Number.isFinite(la) || la <= 0) return 0;
      return la > 1_000_000_000_000 ? la : la * 1000;
   }

   if (typeof la === "string") {
      const t = Date.parse(la);
      return Number.isFinite(t) ? t : 0;
   }

   return 0;
}

export function isVictimOnline(victim: Victim | null | undefined): boolean {
   if (!victim) return false;

   const lastMs = getLastActiveMs(victim);
   if (lastMs > 0) {
      const diff = Date.now() - lastMs;
      return diff <= 5 * 60 * 1000;
   }

   if (typeof victim.online === "boolean") return victim.online;

   const status = typeof victim.status === "string" ? victim.status.toLowerCase() : "";
   if (status === "online") return true;
   if (status === "offline") return false;

   return false;
}

export function formatTime(timestampMs: number): string {
   if (!timestampMs) return "Unknown";
   const date = new Date(timestampMs);
   if (Number.isNaN(date.getTime())) return "Unknown";

   const diff = Date.now() - date.getTime();
   if (diff < 60 * 1000) return "Just now";
   if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
   if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
   return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
}