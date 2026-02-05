"use client";

import { useEffect, useMemo, useState } from "react";

import { BuildCard } from "./build-card";
import { useBuilderBuildHistory } from "../../hooks/use-builder-build-history";
import { useVictimsQuery } from "../../../hooks/use-victims-query";
import type { Victim } from "../../../api/victims";

export function BuildsList() {
   const [login] = useState<string>(() => {
      try {
         return String(localStorage.getItem("webrat_login") || "").trim();
      } catch {
         return "";
      }
   });

   const { items, save } = useBuilderBuildHistory(login);

   const victimsQ = useVictimsQuery();

   const victimsCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      const victims = (victimsQ.data || []) as Victim[];
      victims.forEach((v) => {
         const vv = v as unknown as { buildId?: unknown; build_id?: unknown; buildID?: unknown };
         const raw = vv.buildId ?? vv.build_id ?? vv.buildID;
         const bid = String(raw || "").trim();
         if (!bid) return;
         counts[bid] = (counts[bid] || 0) + 1;
      });
      return counts;
   }, [victimsQ.data]);

   useEffect(() => {
      if (!items.length) return;
      let changed = false;
      const next = items.map((b) => {
         const newVictims = victimsCounts[b.id] || 0;
         if (b.victims !== newVictims) {
            changed = true;
            return { ...b, victims: newVictims };
         }
         return b;
      });
      if (changed) save(next);
   }, [items, save, victimsCounts]);

   return (
      <div id="buildsList" className="builds-list mt-[22px] ml-[32px] flex max-w-full flex-wrap gap-[12px]">
         {items.map((b) => (
            <BuildCard
               key={b.id}
               item={b}
               onDelete={(id) => {
                  const next = items.filter((x) => x.id !== id);
                  save(next);
               }}
               onInfo={(id) => {
                  const build = items.find((x) => String(x.id) === String(id));
                  if (!build) return;
                  try {
                     window.WebRatCommon?.showToast?.("Info", `Build ${build.name || ""}\nID: ${build.id || ""}`);
                  } catch {
                  }
               }}
            />
         ))}
      </div>
   );
}
