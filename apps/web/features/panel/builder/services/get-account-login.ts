export async function resolveAccountLogin(): Promise<string> {
   const resp = await fetch("/api/account/", { method: "GET", cache: "no-store", credentials: "include" });
   if (!resp.ok) throw new Error("account http " + resp.status);

   const data = (await resp.json().catch(() => null)) as unknown;
   const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
   const login = String(obj?.login || "").trim();
   if (!login) throw new Error("missing login");

   try {
      localStorage.setItem("webrat_login", login);
   } catch {
   }

   return login;
}