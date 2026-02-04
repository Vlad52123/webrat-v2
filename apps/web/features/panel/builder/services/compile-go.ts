import { csrfHeaders } from "../utils/csrf";

export type CompileGoRequest = {
   code: string;
   name: string;
   password: string;
   forceAdmin: string;
   iconBase64: string;
};

export type CompileGoEnqueueResponse = {
   id: string;
};

export type CompileGoStatusResponse = {
   status: "pending" | "running" | "done" | "error" | string;
   error?: string;
};

export async function compileGo(req: CompileGoRequest): Promise<{ blob: Blob; filename: string }> {
   const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...csrfHeaders(),
   };

   const enqueueResp = await fetch("/api/compile-go", {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({
         code: req.code,
         name: req.name,
         password: req.password,
         forceAdmin: req.forceAdmin,
         icon: req.iconBase64 || "",
      }),
   });

   if (enqueueResp.status === 429) {
      throw new Error("Build already in progress");
   }

   if (!enqueueResp.ok) {
      const errText = await enqueueResp.text().catch(() => "");
      throw new Error(errText || `Compile enqueue failed (${enqueueResp.status})`);
   }

   const enqueueData = (await enqueueResp.json().catch(() => ({}))) as Partial<CompileGoEnqueueResponse>;
   const jobId = enqueueData && enqueueData.id ? String(enqueueData.id) : "";
   if (!jobId) throw new Error("Compile enqueue failed: missing id");

   const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
   const pollDeadline = Date.now() + 10 * 60 * 1000;
   let pollMs = 1200;

   while (Date.now() < pollDeadline) {
      await sleep(pollMs);

      const stResp = await fetch(`/api/compile-status?id=${encodeURIComponent(jobId)}`, {
         method: "GET",
         credentials: "same-origin",
         headers: { ...csrfHeaders() },
      });

      if (!stResp.ok) {
         const errText = await stResp.text().catch(() => "");
         throw new Error(errText || `Compile status failed (${stResp.status})`);
      }

      const st = (await stResp.json().catch(() => ({}))) as Partial<CompileGoStatusResponse>;
      const status = st && st.status ? String(st.status) : "";

      if (status === "done") break;
      if (status === "error") throw new Error(st && st.error ? String(st.error) : "Compile failed");

      pollMs = Math.min(5000, Math.round(pollMs * 1.25));
   }

   if (Date.now() >= pollDeadline) {
      throw new Error("Compile timeout");
   }

   const dlResp = await fetch(`/api/compile-download?id=${encodeURIComponent(jobId)}`, {
      method: "GET",
      credentials: "same-origin",
      headers: { ...csrfHeaders() },
   });

   if (!dlResp.ok) {
      const errText = await dlResp.text().catch(() => "");
      throw new Error(errText || `Compile download failed (${dlResp.status})`);
   }

   const blob = await dlResp.blob();

   let filename = (String(req.name || "").trim() || "build") + ".zip";
   try {
      const cd = dlResp.headers.get("Content-Disposition") || "";
      const m2 = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const raw = m2 ? (m2[1] || m2[2] || "") : "";
      if (raw) filename = decodeURIComponent(raw);
   } catch {
   }

   return { blob, filename };
}