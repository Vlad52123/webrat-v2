import { getCookie } from "./utils";

export async function verifyCaptchaServerSide(): Promise<{ ok: boolean; status: number }> {
   try {
      const csrf = getCookie("webrat_csrf");
      const res = await fetch(`/api/captcha-verify`, {
         method: "POST",
         credentials: "include",
         headers: {
            ...(csrf ? { "X-CSRF-Token": csrf } : {}),
         },
      });
      return { ok: res.ok, status: res.status };
   } catch {
      return { ok: false, status: 0 };
   }
}