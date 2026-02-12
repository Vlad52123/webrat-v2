"use client";

import { memo } from "react";

import type { CommunityLine } from "../types";

export const CommunityLineRow = memo(function CommunityLineRow(props: {
   line: CommunityLine;
   onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
   const { line, onLinkClick } = props;

   if (line.type === "text") {
      return (
         <div className="text-[13px] leading-[1.45] font-medium text-[rgba(255,255,255,0.70)]">
            {line.text}
         </div>
      );
   }

   return (
      <div className="text-[13px] leading-[1.45] font-medium text-[rgba(255,255,255,0.70)]">
         <span className="inline-block w-[18px] font-bold text-[rgba(255,255,255,0.40)]">{line.prefix}</span>{" "}
         <a
            className="font-bold text-[rgba(255,255,255,0.92)] underline decoration-[rgba(255,255,255,0.20)] underline-offset-[3px] transition-[color,text-decoration-color] duration-[140ms] hover:text-white hover:decoration-[rgba(255,255,255,0.50)]"
            href={line.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkClick}
         >
            {line.label}
         </a>
      </div>
   );
});