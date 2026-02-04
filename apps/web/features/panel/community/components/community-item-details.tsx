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
      <div className="mt-3 rounded-[12px] border border-white/10 bg-[rgba(0,0,0,0.18)] p-3">
         <div className="mb-2 font-black text-white/95">{item.detailsTitle}</div>
         <div className="flex flex-col gap-[6px]">
            {item.lines.map((line, idx) => (
               <CommunityLineRow key={idx} line={line} onLinkClick={onLinkClick} />
            ))}
         </div>
      </div>
   );
});