"use client";

import { memo } from "react";

import type { CommunityLine } from "../types";

export const CommunityLineRow = memo(function CommunityLineRow(props: {
   line: CommunityLine;
   onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
   const { line, onLinkClick } = props;

   if (line.type === "text") {
      return <div className="text-[13px] leading-[1.3] text-white/85">{line.text}</div>;
   }

   return (
      <div className="text-[13px] leading-[1.3] text-white/85">
         <span className="inline-block w-[18px] cursor-default font-bold text-white/70">{line.prefix}</span>{" "}
         <a
            className="font-extrabold text-[rgb(240,105,236)] hover:underline"
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