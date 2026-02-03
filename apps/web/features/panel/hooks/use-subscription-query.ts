import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { getJson } from "../../../lib/api";
import { showToast } from "../toast";

export type SubscriptionResponse = {
  status?: string;
  activated_at?: string;
  kind?: string;
};

export function useSubscriptionQuery() {
  const didToast404Ref = useRef(false);

  const q = useQuery<SubscriptionResponse>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const data = await getJson<SubscriptionResponse>("/api/subscription/");
      return data;
    },
    refetchInterval: (query) => (query.state.status === "success" ? 60_000 : false),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

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