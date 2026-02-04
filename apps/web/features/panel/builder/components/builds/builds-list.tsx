"use client";

import { useState } from "react";

import { BuildCard } from "./build-card";
import { showToastSafe } from "../../utils/toast";
import { useBuilderBuildHistory } from "../../hooks/use-builder-build-history";

export function BuildsList() {
   const [login] = useState<string>(() => {
      try {
         return String(localStorage.getItem("webrat_login") || "").trim();
      } catch {
         return "";
      }
   });

   const { items, save } = useBuilderBuildHistory(login);

   return (
      <div id="buildsList" className="builds-list mt-[22px] ml-[32px] flex max-w-full flex-wrap gap-[12px]">
         {items.map((b) => (
            <BuildCard
               key={b.id}
               item={b}
               onDelete={(id) => {
                  const next = items.filter((x) => x.id !== id);
                  save(next);
                  showToastSafe("success", "Build removed");
               }}
               onInfo={() => {
                  showToastSafe("info", "Info view is being ported");
               }}
            />
         ))}
      </div>
   );
}
