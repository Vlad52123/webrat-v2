import { useEffect } from "react";

export function useExtensionSync(): void {
    useEffect(() => {
        const buildName = document.getElementById("buildName") as HTMLInputElement | null;
        const extensionInput = document.getElementById("extension") as HTMLInputElement | null;
        if (!buildName || !extensionInput) return;

        const updateExtensionFromName = () => {
            let raw = String(buildName.value || "").trim();
            if (!raw) {
                extensionInput.value = "webcrystal.exe";
                return;
            }
            raw = raw.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 25);
            extensionInput.value = raw + ".exe";
        };

        updateExtensionFromName();
        buildName.addEventListener("input", updateExtensionFromName);
        return () => buildName.removeEventListener("input", updateExtensionFromName);
    }, []);
}
