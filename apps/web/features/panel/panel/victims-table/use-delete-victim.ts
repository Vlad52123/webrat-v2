import { useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";

import type { Victim } from "../../api/victims";
import { csrfHeaders } from "../../builder/utils/csrf";
import { showToast } from "../../toast";

export function useDeleteVictim(qc: QueryClient) {
    return useCallback(
        async (victimId: string) => {
            const id = String(victimId || "").trim();
            if (!id) return;

            qc.setQueryData(["victims"], (prev: unknown) => {
                const arr = Array.isArray(prev) ? (prev as Victim[]) : [];
                return arr.filter((v) => String((v as { id?: unknown }).id ?? "") !== id);
            });

            try {
                const res = await fetch(`/api/victims/?id=${encodeURIComponent(id)}`, {
                    method: "DELETE",
                    credentials: "same-origin",
                    headers: {
                        ...csrfHeaders(),
                    },
                });
                if (!res.ok) {
                    let msg = "Failed to delete victim";
                    try {
                        const t = await res.text();
                        if (t && String(t).trim()) msg = String(t).trim();
                    } catch {
                    }
                    showToast("error", msg);
                    try {
                        await qc.invalidateQueries({ queryKey: ["victims"] });
                    } catch {
                    }
                    return;
                }

            } catch {
                showToast("error", "Failed to delete victim");
                try {
                    await qc.invalidateQueries({ queryKey: ["victims"] });
                } catch {
                }
            }
        },
        [qc],
    );
}
