"use client";

import { useCallback, useState } from "react";

import { communityItems, communityMessageCounts } from "../community/data";
import { CommunityItemCard } from "../community/components/community-item-card";

export function CommunityScreen() {
   const [openKey, setOpenKey] = useState<string | null>(null);

   const onToggle = useCallback((key: string) => {
      setOpenKey((prev) => (prev === key ? null : key));
   }, []);

   return (
      <div id="communityView" className="h-full overflow-hidden">
         <div className="mx-auto w-full max-w-[min(900px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[28px]">
            <div className="mb-[20px] text-center">
               <div className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.30)]">Community</div>
            </div>
            <div className="flex flex-col gap-[10px]">
               {communityItems.map((it) => (
                  <CommunityItemCard
                     key={it.key}
                     item={it}
                     isOpen={openKey === it.key}
                     messageCount={communityMessageCounts.get(it.key) ?? 0}
                     onToggle={onToggle}
                  />
               ))}
            </div>
         </div>
      </div>
   );
}