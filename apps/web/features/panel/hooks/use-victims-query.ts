import { useQuery } from "@tanstack/react-query";

import { fetchVictims } from "../api/victims";
import { usePanelWS } from "../ws/ws-provider";

export function useVictimsQuery() {
    const ws = usePanelWS();

    return useQuery({
        queryKey: ["victims"],
        queryFn: fetchVictims,
        staleTime: 10_000,
        refetchInterval: (q) => {
            if (ws.state === "open") return false;
            return q.state.status === "success" ? 15_000 : false;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
    });
}
