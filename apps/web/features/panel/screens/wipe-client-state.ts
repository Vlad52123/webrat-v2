import { makeBgVideoDb } from "../settings/bg-video-db";
import { STORAGE_KEYS, prefKey, removePref } from "../settings/storage";

export async function wipeClientState() {
   try {
      try {
         sessionStorage.clear();
      } catch {
      }
      try {
         localStorage.removeItem("webrat_login");
         localStorage.removeItem("webrat_reg_date");
      } catch {
      }
      try {
         Object.values(STORAGE_KEYS).forEach((k) => {
            try {
               removePref(String(k));
            } catch {
            }
            try {
               localStorage.removeItem(String(k));
            } catch {
            }
         });
      } catch {
      }
      try {
         const db = makeBgVideoDb(prefKey("bgVideo"));
         await db.del();
      } catch {
      }
   } catch {
   }
}