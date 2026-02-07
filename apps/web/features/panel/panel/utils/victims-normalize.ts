import type { Victim } from "../../api/victims";

import { getLastActiveMs, isVictimOnline } from "./victim-status";

function makeVictimKey(v: Victim): string {
   try {
      const id = String((v as unknown as { id?: unknown }).id ?? "").trim();
      const ip = String((v as unknown as { ip?: unknown }).ip ?? "").trim();
      const host = String((v as unknown as { hostname?: unknown }).hostname ?? "").trim();
      const user = String((v as unknown as { user?: unknown }).user ?? "").trim();

      const fp = [ip, host, user].filter(Boolean).join("|");
      if (fp) return `fp:${fp}`;

      if (id) {
         const parts = id.split("_").filter(Boolean);
         if (parts.length >= 4) {
            const stable = parts.slice(0, 3).join("_");
            if (stable) return `idfp:${stable}`;
         }
      }

      if (id) return `id:${id}`;
   } catch {
   }
   return "";
}

function pickBetter(a: Victim, b: Victim): Victim {
   const aOnline = isVictimOnline(a);
   const bOnline = isVictimOnline(b);
   if (aOnline !== bOnline) return aOnline ? a : b;

   const aMs = getLastActiveMs(a);
   const bMs = getLastActiveMs(b);
   if (aMs !== bMs) return aMs > bMs ? a : b;

   const aId = String((a as unknown as { id?: unknown }).id ?? "");
   const bId = String((b as unknown as { id?: unknown }).id ?? "");
   if (aId && !bId) return a;
   if (!aId && bId) return b;

   return a;
}

export function dedupeVictims(list: Victim[]): Victim[] {
   const m = new Map<string, Victim>();
   for (const v of list) {
      if (!v) continue;
      const key = makeVictimKey(v);
      if (!key) continue;
      const prev = m.get(key);
      if (!prev) {
         m.set(key, v);
         continue;
      }
      m.set(key, pickBetter(prev, v));
   }
   return Array.from(m.values());
}

export type StatusSortMode = "online_first" | "offline_first";

export function stableSortVictims(params: {
   list: Victim[];
   sortMode: StatusSortMode;
   stableIndexByKey: Map<string, number>;
   nextIndexRef: { current: number };
}): Victim[] {
   const { list, sortMode, stableIndexByKey, nextIndexRef } = params;

   const keyOf = (v: Victim) => {
      const k = makeVictimKey(v);
      if (k) return k;
      const id = String((v as unknown as { id?: unknown }).id ?? "").trim();
      return id ? `id:${id}` : "";
   };

   for (const v of list) {
      const k = keyOf(v);
      if (!k) continue;
      if (!stableIndexByKey.has(k)) {
         stableIndexByKey.set(k, nextIndexRef.current++);
      }
   }

   const rank = (v: Victim): number => {
      const on = isVictimOnline(v);
      if (sortMode === "offline_first") return on ? 1 : 0;
      return on ? 0 : 1;
   };

   return [...list].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;

      const aMs = getLastActiveMs(a);
      const bMs = getLastActiveMs(b);
      if (aMs !== bMs) return bMs - aMs;

      const ak = keyOf(a);
      const bk = keyOf(b);
      const ai = ak ? stableIndexByKey.get(ak) ?? 0 : 0;
      const bi = bk ? stableIndexByKey.get(bk) ?? 0 : 0;
      if (ai !== bi) return ai - bi;

      return 0;
   });
}