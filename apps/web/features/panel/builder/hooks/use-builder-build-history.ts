import { useEffect, useMemo, useState } from "react";

export type BuildHistoryItem = {
   id: string;
   name: string;
   version?: string;
   victims?: number;
   created?: string;
};

function getBuildsKey(login: string): string {
   const safe = String(login || "").trim();
   if (!safe) return "webrat_builds";
   return "webrat_builds_" + safe;
}

export function useBuilderBuildHistory(login: string) {
   const key = useMemo(() => getBuildsKey(login), [login]);
   const [items, setItems] = useState<BuildHistoryItem[]>(() => {
      try {
         const raw = localStorage.getItem(key);
         if (!raw) return [];
         const parsed = JSON.parse(raw);
         if (!Array.isArray(parsed)) return [];
         return parsed as BuildHistoryItem[];
      } catch {
         return [];
      }
   });

   useEffect(() => {
      const t = window.setTimeout(() => {
         try {
            const raw = localStorage.getItem(key);
            if (!raw) {
               setItems([]);
               return;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
               setItems([]);
               return;
            }
            setItems(parsed as BuildHistoryItem[]);
         } catch {
            setItems([]);
         }
      }, 0);
      return () => window.clearTimeout(t);
   }, [key]);

   const save = (next: BuildHistoryItem[]) => {
      setItems(next);
      try {
         localStorage.setItem(key, JSON.stringify(next));
      } catch {
      }
   };

   return { items, save };
}
