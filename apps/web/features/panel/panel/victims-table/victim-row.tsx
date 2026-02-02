import Image from "next/image";

import { cn } from "../../../../lib/utils";

import type { Victim } from "../../api/victims";
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
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const { victim: v, isSelected, onClick, onDoubleClick } = props;

  const online = typeof v.online === "boolean" ? v.online : String(v.status ?? "").toLowerCase() === "online";
  const id = String(v.id ?? "");
  const flag = countryCodeToFlagEmoji(v.country);

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
      <td className="w-[38px] min-w-[38px] px-[8px] py-[4px] text-left whitespace-nowrap">{flag || v.country || ""}</td>

      <td className="w-[40px] min-w-[40px] px-[8px] py-[4px] text-left whitespace-nowrap">
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

      <td className="w-[110px] min-w-[110px] px-[8px] py-[4px] text-left whitespace-nowrap font-normal text-white/[0.96]">
        {v.user ?? ""}
      </td>

      <td className="w-[80px] min-w-[80px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.admin ? "True" : "False"}</td>

      <td className="w-[140px] min-w-[140px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.hostname ?? ""}</td>

      <td className="w-[230px] min-w-[230px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.window ?? ""}</td>

      <td className="w-[110px] min-w-[110px] px-[8px] py-[4px] text-left whitespace-nowrap">{formatLastActive(v.last_active)}</td>

      <td className="w-[150px] min-w-[150px] px-[8px] py-[4px] text-left whitespace-nowrap">{id}</td>

      <td className="w-[120px] min-w-[120px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.ip ?? ""}</td>

      <td className="w-[130px] min-w-[130px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.os ?? ""}</td>

      <td className="w-[140px] min-w-[140px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.cpu ?? ""}</td>

      <td className="w-[90px] min-w-[90px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.ram ?? ""}</td>

      <td className="w-[140px] min-w-[140px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.gpu ?? ""}</td>

      <td className="w-[110px] min-w-[110px] px-[8px] py-[4px] text-left whitespace-nowrap">{v.comment ?? ""}</td>
    </tr>
  );
}