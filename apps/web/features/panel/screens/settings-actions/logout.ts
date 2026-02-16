import { wipeClientState } from "../wipe-client-state";
import { csrfHeaders } from "../../builder/utils/csrf";

export async function logoutAndRedirect(): Promise<void> {
    wipeClientState().catch(() => { });

    try {
        await fetch(`/api/logout`, {
            method: "POST",
            credentials: "include",
            headers: { ...csrfHeaders() },
        });
    } catch {
    }

    if (typeof window !== "undefined") {
        window.location.href = "/login/";
    }
}
