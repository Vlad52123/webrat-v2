import { useQuery } from "@tanstack/react-query";

import { fetchVictims } from "../api/victims";

export function useVictimsQuery() {
  return useQuery({
    queryKey: ["victims"],
    queryFn: fetchVictims,
    refetchInterval: 5000,
    retry: false,
  });
}