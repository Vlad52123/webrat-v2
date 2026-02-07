import { useEffect, useRef } from "react";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { getJson } from "../../../lib/api";
import { showToast } from "../toast";

export type SubscriptionResponse = {
   status?: string;
   activated_at?: string;
   kind?: string;
};

function subCacheKey(): string {
   try {
      if (typeof window === "undefined") return "webrat_subscription_cache";
      const login = String(localStorage.getItem("webrat_login") || "")
         .trim()
         .toLowerCase()
         .replace(/[^a-z0-9_-]/g, "")
         .slice(0, 32);
      return login ? `webrat_subscription_cache:${login}` : "webrat_subscription_cache";
   } catch {
      return "webrat_subscription_cache";
   }
}

function readCachedSubscription(): SubscriptionResponse | undefined {
   try {
      if (typeof window === "undefined") return undefined;
      const raw = localStorage.getItem(subCacheKey());
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return undefined;
      const obj = parsed as Record<string, unknown>;
      const status = String(obj.status || "").trim();
      const activated_at = String(obj.activated_at || "").trim();
      const kind = String(obj.kind || "").trim();
      if (!status && !activated_at && !kind) return undefined;
      return { status: status || undefined, activated_at: activated_at || undefined, kind: kind || undefined };
   } catch {
      return undefined;
   }
}

function writeCachedSubscription(data: SubscriptionResponse) {
   try {
      if (typeof window === "undefined") return;
      localStorage.setItem(subCacheKey(), JSON.stringify(data));
      try {
         localStorage.removeItem("webrat_subscription_cache");
      } catch {
      }
   } catch {
   }
}

export function useSubscriptionQuery(): UseQueryResult<SubscriptionResponse, Error> {
   const didToast404Ref = useRef(false);

   const cached = readCachedSubscription();

   const opts: UseQueryOptions<SubscriptionResponse, Error, SubscriptionResponse, readonly ["subscription"]> = {
      queryKey: ["subscription"] as const,
      queryFn: async () => {
         const data = await getJson<SubscriptionResponse>("/api/subscription/");
         return data;
      },
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchInterval: (query: any) => (query?.state?.status === "success" ? 60_000 : false),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
   };

   if (cached) {
      opts.initialData = cached;
   }

   const q = useQuery<SubscriptionResponse, Error, SubscriptionResponse, readonly ["subscription"]>(opts);

   useEffect(() => {
      if (!q.isSuccess) return;
      if (!q.data) return;
      writeCachedSubscription(q.data);
   }, [q.data, q.isSuccess]);

   useEffect(() => {
      if (typeof window === "undefined") return;
      if (didToast404Ref.current) return;
      if (!q.isError) return;
      const err = q.error as unknown as { status?: unknown } | null;
      const statusRaw = err?.status;
      const status = typeof statusRaw === "number" && Number.isFinite(statusRaw) ? statusRaw : null;
      if (status !== 404) return;

      didToast404Ref.current = true;
      showToast("error", "API error: /api/subscription not found");
   }, [q.error, q.isError]);

   return q;
}