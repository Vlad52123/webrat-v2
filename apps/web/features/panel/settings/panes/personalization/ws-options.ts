export const WS_OPTIONS = [
   { value: "__default__", label: "Default" },
   { value: "ru.webcrystal.sbs", label: "Russia" },
   { value: "kz.webcrystal.sbs", label: "Kazakhstan" },
   { value: "ua.webcrystal.sbs", label: "Ukraine" },
] as const;

export type WsOptionValue = (typeof WS_OPTIONS)[number]["value"];

export function wsLabel(value: string): string {
   if (value === "__default__") return "Default";
   if (value === "ru.webcrystal.sbs") return "Russia";
   if (value === "kz.webcrystal.sbs") return "Kazakhstan";
   if (value === "ua.webcrystal.sbs") return "Ukraine";
   return value;
}