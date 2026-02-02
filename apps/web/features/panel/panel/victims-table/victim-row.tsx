import Image from "next/image";

import { cn } from "../../../../lib/utils";

import type { Victim } from "../../api/victims";
import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";
import { countryCodeToFlagEmoji } from "../utils/country-flag";
import { getVictimDeviceIconSrc } from "../utils/victim-device-icon";

function formatLastActive(la: Victim["last_active"]): string {
  try {
    if (typeof la === "number") {
      const ms = la > 1_000_000_000_000 ? la : la * 1000;
      return new Date(ms).toLocaleString();
    }
    if (typeof la === "string") {
      const parsed = Date.parse(la);
      return Number.isNaN(parsed) ? la : new Date(parsed).toLocaleString();
    }
  } catch {
  }
  return "";
}

export function VictimRow(props: {
  victim: Victim;
  columnOrder: VictimsColumnKey[];
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const { victim: v, columnOrder, isSelected, onClick, onDoubleClick } = props;

  const online = typeof v.online === "boolean" ? v.online : String(v.status ?? "").toLowerCase() === "online";
  const id = String(v.id ?? "");
  const flag = countryCodeToFlagEmoji(v.country);

  const cellBase = "px-[8px] py-[4px] text-left whitespace-nowrap";

  const renderCell = (col: VictimsColumnKey) => {
    switch (col) {
      case "h-country":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {flag || v.country || ""}
          </td>
        );
      case "h-icon":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            <Image
              className={cn(
                "h-[36px] w-[36px] align-middle opacity-90",
                "[filter:grayscale(1)_brightness(0.7)]",
                online &&
                "opacity-100 ![filter:brightness(0)_saturate(100%)_invert(36%)_sepia(99%)_saturate(4245%)_hue-rotate(306deg)_brightness(104%)_contrast(106%)]",
              )}
              src={getVictimDeviceIconSrc(v)}
              alt="icon"
              width={36}
              height={36}
              draggable={false}
            />
          </td>
        );
      case "h-user":
        return (
          <td
            key={col}
            className={cn(col, victimsColumnSizeClass(col), cellBase, "font-normal text-white/[0.96]")}
          >
            {v.user ?? ""}
          </td>
        );
      case "h-admin":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.admin ? "True" : "False"}
          </td>
        );
      case "h-pc-name":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.hostname ?? ""}
          </td>
        );
      case "h-window":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.window ?? ""}
          </td>
        );
      case "h-last-active":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {formatLastActive(v.last_active)}
          </td>
        );
      case "h-id":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {id}
          </td>
        );
      case "h-ip":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.ip ?? ""}
          </td>
        );
      case "h-os":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.os ?? ""}
          </td>
        );
      case "h-cpu":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.cpu ?? ""}
          </td>
        );
      case "h-ram":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.ram ?? ""}
          </td>
        );
      case "h-gpu":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.gpu ?? ""}
          </td>
        );
      case "h-comment":
        return (
          <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
            {v.comment ?? ""}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <tr
      data-victim-id={id}
      className={cn(
        "border-b border-white/[0.04]",
        "hover:bg-white/[0.03]",
        isSelected && "bg-white/[0.04]",
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {columnOrder.map(renderCell)}
    </tr>
  );
}