import type { Victim } from "../../api/victims";

export type VictimDeviceIconKey = "computer" | "laptop";

export function getVictimDeviceIconKey(v: Victim): VictimDeviceIconKey {
   const raw = String(v.deviceType ?? v.device_type ?? "").toLowerCase();

   if (raw.includes("laptop") || raw.includes("notebook")) return "laptop";
   if (raw.includes("pc") || raw.includes("computer") || raw.includes("desktop")) return "computer";

   return "computer";
}

export function getVictimDeviceIconSrc(v: Victim): string {
   const key = getVictimDeviceIconKey(v);
   return key === "laptop" ? "/icons/laptop.svg" : "/icons/computer.svg";
}