import { useQuery } from "@tanstack/react-query";

import { fetchVictims } from "../api/victims";

export function useVictimsQuery() {
  return useQuery({
    queryKey: ["victims"],
    queryFn: fetchVictims,
    refetchInterval: (q) => (q.state.status === "success" ? 15_000 : false),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}