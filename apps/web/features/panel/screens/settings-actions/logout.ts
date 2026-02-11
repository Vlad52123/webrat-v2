import { wipeClientState } from "../wipe-client-state";

export async function logoutAndRedirect(): Promise<void> {
   try {
      await wipeClientState();
   } catch {
   }
   try {
      await fetch(`/api/logout`, { method: "POST", credentials: "include" });
   } catch {
   }
   if (typeof window !== "undefined") {
      window.location.href = "/login/";
   }
}