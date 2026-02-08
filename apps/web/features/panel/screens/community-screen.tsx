"use client";

import { useCallback, useEffect, useState } from "react";

import { communityItems, communityMessageCounts } from "../community/data";
import { CommunityItemCard } from "../community/components/community-item-card";

export function CommunityScreen() {
   const [openKey, setOpenKey] = useState<string | null>(null);
   const [enterShake, setEnterShake] = useState(true);

   useEffect(() => {
      setEnterShake(true);
      const t = window.setTimeout(() => setEnterShake(false), 850);
      return () => window.clearTimeout(t);
   }, []);

   const onToggle = useCallback((key: string) => {
      setOpenKey((prev) => (prev === key ? null : key));
   }, []);

   return (
      <div id="communityView" className="h-full overflow-hidden">
         <div className="mx-auto w-full max-w-[min(1500px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
            <div className="flex flex-col gap-[14px]">
               {communityItems.map((it) => (
                  <CommunityItemCard
                     key={it.key}
                     item={it}
                     isOpen={openKey === it.key}
                     messageCount={communityMessageCounts.get(it.key) ?? 0}
                     enterShake={enterShake}
                     onToggle={onToggle}
                  />
               ))}
            </div>
         </div>
      </div>
   );
}