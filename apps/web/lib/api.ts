export const API_BASE_URL =
   process.env.NEXT_PUBLIC_API_URL ?? "";

type JsonObject = Record<string, unknown>;

function safeParseJSON(text: string): unknown {
   const t = String(text ?? "");
   if (!t.trim()) return null;
   try {
      return JSON.parse(t) as unknown;
   } catch {
      return null;
   }
}

export async function getJson<T>(path: string): Promise<T> {
   const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
   });

   const text = await res.text();
   const data = safeParseJSON(text);

   if (!res.ok) {
      const message =
         typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : `HTTP_${res.status}`;

      const err = new Error(message) as Error & { status?: number };
      err.status = res.status;
      throw err;
   }

   return data as T;
}

export async function postJson<T>(path: string, body: JsonObject): Promise<T> {
   const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
   });

   const text = await res.text();
   const data = safeParseJSON(text);

   if (!res.ok) {
      const message =
         typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : `HTTP_${res.status}`;

      const err = new Error(message) as Error & { status?: number };
      err.status = res.status;
      throw err;
   }

   return data as T;
}