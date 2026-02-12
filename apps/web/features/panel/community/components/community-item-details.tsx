"use client";

import { memo, useCallback } from "react";

import type { CommunityItem } from "../types";
import { CommunityLineRow } from "./community-line";

export const CommunityItemDetails = memo(function CommunityItemDetails(props: { item: CommunityItem }) {
   const { item } = props;

   const onLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
   }, []);

   return (
      <div className="mt-[14px] rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.20)] p-[14px]">
         <div className="mb-[10px] text-[12px] font-extrabold uppercase tracking-[0.8px] text-[rgba(255,255,255,0.50)]">
            {item.detailsTitle}
         </div>
         <div className="flex flex-col gap-[6px]">
            {item.lines.map((line, idx) => (
               <CommunityLineRow key={idx} line={line} onLinkClick={onLinkClick} />
            ))}
         </div>
      </div>
   );
});