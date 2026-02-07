import { csrfHeaders } from "../../builder/utils/csrf";
import { wipeClientState } from "../wipe-client-state";

export async function deleteAccountAction(pwd: string, opts: {
   setError: (msg: string) => void;
   setOpen: (open: boolean) => void;
}): Promise<void> {
   const { setError, setOpen } = opts;

   if (!pwd) {
      setError("Enter password");
      return;
   }

   try {
      const res = await fetch(`/api/delete-account/`, {
         method: "POST",
         credentials: "include",
         headers: { "Content-Type": "application/json", ...csrfHeaders() },
         body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
         await wipeClientState();
         setOpen(false);
         if (typeof window !== "undefined") {
            window.location.replace("/login");
         }
         return;
      }
      if (res.status === 401) {
         setError("Password is incorrect");
         return;
      }
      setError("Delete account failed");
   } catch {
      setError("Delete account failed");
   }
}