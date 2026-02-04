import type { LoginValues } from "./schemas";

export type LoginRequest = LoginValues & { cfToken?: string };

function getCookie(name: string): string {
   const parts = String(document.cookie || "").split(";");
   for (const p of parts) {
      const kv = p.trim();
      if (!kv) continue;
      const eq = kv.indexOf("=");
      const k = eq >= 0 ? kv.slice(0, eq) : kv;
      if (k === name) return eq >= 0 ? decodeURIComponent(kv.slice(eq + 1)) : "";
   }
   return "";
}

export async function login(values: LoginValues, cfToken = ""): Promise<void> {
   const csrf = getCookie("webrat_csrf");
   const res = await fetch(`/api/login`, {
      method: "POST",
      credentials: "include",
      headers: {
         "Content-Type": "application/json",
         ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      body: JSON.stringify({ ...values, cfToken } as LoginRequest),
   });

   const text = await res.text();
   const data = text ? (JSON.parse(text) as unknown) : null;

   if (!res.ok) {
      let retryAfterSeconds: number | null = null;
      if (res.status === 429) {
         try {
            const ra = res.headers.get("Retry-After");
            const n = parseInt(String(ra || "").trim(), 10);
            if (Number.isFinite(n) && n > 0) retryAfterSeconds = n;
         } catch {
            retryAfterSeconds = null;
         }
      }

      const message =
         typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : `HTTP_${res.status}`;

      const err = new Error(message) as Error & { status?: number; retryAfterSeconds?: number | null };
      err.status = res.status;
      err.retryAfterSeconds = retryAfterSeconds;
      throw err;
   }
}