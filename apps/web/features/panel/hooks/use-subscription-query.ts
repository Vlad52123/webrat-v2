import { useQuery } from "@tanstack/react-query";

import { getJson } from "../../../lib/api";

export type SubscriptionResponse = {
  status?: string;
  activated_at?: string;
  kind?: string;
};

export function useSubscriptionQuery() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const data = await getJson<SubscriptionResponse>("/api/subscription");
      return data;
    },
    refetchInterval: 60_000,
    retry: false,
  });
}
