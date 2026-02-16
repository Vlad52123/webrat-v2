export function setBuildingUi(building: boolean, progressText: string) {
    const createBtn = document.getElementById("createBtn") as HTMLButtonElement | null;
    const buildProgress = document.getElementById("buildProgress") as HTMLDivElement | null;
    const buildProgressText = document.getElementById("buildProgressText") as HTMLDivElement | null;
    const builderToggle = document.getElementById("builderToggle") as HTMLButtonElement | null;

    const builderGrid = document.querySelector(".builderGrid") as HTMLDivElement | null;
    const builderFooter = document.querySelector(".builderFooter") as HTMLDivElement | null;
    const builderFormInner = document.querySelector(".builderFormInner") as HTMLDivElement | null;

    if (createBtn) createBtn.disabled = building;
    if (builderFormInner) builderFormInner.classList.toggle("isBuilding", building);
    if (builderGrid) builderGrid.hidden = building;
    if (builderFooter) builderFooter.hidden = building;
    if (builderToggle) builderToggle.hidden = building;

    if (buildProgress) buildProgress.hidden = !building;
    if (buildProgressText) buildProgressText.textContent = progressText;
}

export function resetBuilderDefaults(
    setIconBase64: (v: string) => void,
    setDelay: (v: number) => void,
    setInstallMode: (v: string) => void,
) {
    try {
        const buildNameEl = document.getElementById("buildName") as HTMLInputElement | null;
        const buildCommentEl = document.getElementById("buildComment") as HTMLInputElement | null;
        const antiAnalysisEl = document.getElementById("antiAnalysis") as HTMLSelectElement | null;
        const autoStealEl = document.getElementById("autoSteal") as HTMLSelectElement | null;
        const forceAdminEl = document.getElementById("forceAdmin") as HTMLSelectElement | null;
        const installModeEl = document.getElementById("installMode") as HTMLSelectElement | null;
        const installPathEl = document.getElementById("installPath") as HTMLInputElement | null;
        const hideFilesEl = document.getElementById("hideFiles") as HTMLInputElement | null;
        const autorunEl = document.getElementById("autorun") as HTMLSelectElement | null;
        const extensionEl = document.getElementById("extension") as HTMLInputElement | null;
        const iconEl = document.getElementById("buildIcon") as HTMLInputElement | null;
        const iconNameEl = document.getElementById("buildIconName") as HTMLDivElement | null;

        if (buildNameEl) buildNameEl.value = "";
        if (buildCommentEl) buildCommentEl.value = "";

        const setSelect = (sel: HTMLSelectElement | null, v: string) => {
            if (!sel) return;
            sel.value = v;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
        };

        setSelect(antiAnalysisEl, "None");
        setSelect(autoStealEl, "Once");
        setSelect(forceAdminEl, "Normal");
        setSelect(autorunEl, "scheduler");

        setInstallMode("random");
        setSelect(installModeEl, "random");
        if (installPathEl) installPathEl.value = "";

        if (hideFilesEl) hideFilesEl.checked = false;

        if (extensionEl) extensionEl.value = "webcrystal.exe";

        setIconBase64("");
        try {
            if (iconEl) iconEl.value = "";
        } catch {
        }
        if (iconNameEl) iconNameEl.textContent = "No icon selected";

        setDelay(2);
    } catch {
    }
}
