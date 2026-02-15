"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Victim } from "../../api/victims";

import { isVictimOnline } from "../utils/victim-status";
import { readWsHostGlobal, writeWsHostGlobal } from "../../settings/storage";
import { useSubscriptionQuery } from "../../hooks/use-subscription-query";
import { showToast } from "../../toast";

const PREMIUM_VALUES = new Set(["ru.webcrystal.sbs", "kz.webcrystal.sbs", "ua.webcrystal.sbs"]);

function getStatus(victim: Victim | null): "waiting" | "connected" | "disconnected" {
   if (!victim) return "waiting";

   const online = isVictimOnline(victim);
   return online ? "connected" : "disconnected";
}

export function DetailStatusCard(props: { victim: Victim | null }) {
   const { victim } = props;
   const status = getStatus(victim);

   const subQ = useSubscriptionQuery();
   const isVip = String(subQ.data?.status || "").toLowerCase() === "vip";

   const btnRef = useRef<HTMLButtonElement | null>(null);
   const menuRef = useRef<HTMLDivElement | null>(null);

   const [wsOpen, setWsOpen] = useState(false);
   const [wsValue, setWsValue] = useState<string>("__default__");
   const [wsMenuPos, setWsMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

   useEffect(() => {
      const readValue = () => {
         const v = readWsHostGlobal();
         setWsValue(v ? v : "__default__");
      };
      readValue();

      const onHost = () => readValue();
      try {
         window.addEventListener("webrat_ws_host_changed", onHost as EventListener);
      } catch {
         return;
      }
      return () => {
         try {
            window.removeEventListener("webrat_ws_host_changed", onHost as EventListener);
         } catch {
         }
      };
   }, []);

   const wsLabel = useMemo(() => {
      const v = String(wsValue || "").trim();
      if (v === "__default__" || v === "") return "Default";
      if (v === "ru.webcrystal.sbs") return "Russia";
      if (v === "kz.webcrystal.sbs") return "Kazakhstan";
      if (v === "ua.webcrystal.sbs") return "Ukraine";
      return v;
   }, [wsValue]);

   useEffect(() => {
      if (!wsOpen) return;

      const onDoc = (e: MouseEvent) => {
         const t = e.target as Node | null;
         if (!t) return;

         const btn = btnRef.current;
         const menu = menuRef.current;
         if (btn && btn.contains(t)) return;
         if (menu && menu.contains(t)) return;
         setWsOpen(false);
      };

      document.addEventListener("mousedown", onDoc);
      return () => {
         document.removeEventListener("mousedown", onDoc);
      };
   }, [wsOpen]);

   const lineColor =
      status === "connected" ? "#4caf50" : status === "disconnected" ? "#f44336" : "#888";

   const pulseSpeed =
      status === "connected" ? "1.2s" : status === "disconnected" ? "0.9s" : "1.5s";

   const label = status === "connected" ? "Connected" : status === "disconnected" ? "Disconnected" : "Waiting for user";

   return (
      <div
         className={
            "mt-auto rounded-[14px] border border-[rgba(120,120,120,0.7)] bg-[rgba(32,32,36,0.9)] px-[8px] pb-[18px] pt-[12px] text-center " +
            "text-[15px] font-semibold text-[rgba(235,235,235,0.97)]"
         }
      >
         <div className="mb-[8px] text-[15px] font-semibold text-[rgba(235,235,235,0.95)]" id="detailStatusPc">
            {victim?.hostname ?? "-"}
         </div>
         <div className="mb-[8px] h-[2px] w-full bg-[var(--line)]" />
         <div className="mb-[4px]" id="detailStatusLabel">
            {label}
         </div>
         <div
            className="mx-auto h-[3px] w-[85%] rounded-full"
            style={{
               background: lineColor,
               opacity: 0.85,
               animation: `detailStatusPulse ${pulseSpeed} ease-in-out infinite`,
            }}
         />
         <style>{`
            @keyframes detailStatusPulse {
               0% { opacity: 0.25; }
               50% { opacity: 1; }
               100% { opacity: 0.25; }
            }
         `}</style>

         <div className="mt-[10px] grid gap-[8px]">
            <button
               id="detailWsSettingsBtn"
               type="button"
               ref={btnRef}
               className={
                  "flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[12px] border border-[rgba(150,150,150,0.3)] " +
                  "bg-[linear-gradient(180deg,rgba(38,38,46,0.92),rgba(18,18,24,0.92))] text-[rgba(240,240,240,0.92)] font-[650] " +
                  "transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-[rgba(220,220,220,0.45)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.45)] active:translate-y-[1px]"
               }
               onClick={() => {
                  const willOpen = !wsOpen;
                  setWsOpen(willOpen);
                  if (!willOpen) {
                     setWsMenuPos(null);
                     return;
                  }
                  const btn = btnRef.current;
                  if (!btn) {
                     setWsMenuPos(null);
                     return;
                  }
                  try {
                     const rect = btn.getBoundingClientRect();
                     setWsMenuPos({ left: rect.left, top: rect.bottom + 8, width: rect.width });
                  } catch {
                     setWsMenuPos(null);
                  }
               }}
            >
               <span>Settings</span>
               <span
                  id="detailWsSettingsValue"
                  className="inline-flex items-center justify-center rounded-full border border-white/[0.14] bg-black/25 px-[8px] py-[2px] text-[12px] font-bold tracking-[0.02em]"
               >
                  {wsLabel}
               </span>
            </button>

            {wsOpen && wsMenuPos
               ? createPortal(
                  <div
                     ref={menuRef}
                     className="fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
                     style={{ left: wsMenuPos.left, top: wsMenuPos.top, width: wsMenuPos.width }}
                     role="listbox"
                  >
                     {[
                        { value: "__default__", label: "Default" },
                        { value: "ru.webcrystal.sbs", label: "Russia" },
                        { value: "kz.webcrystal.sbs", label: "Kazakhstan" },
                        { value: "ua.webcrystal.sbs", label: "Ukraine" },
                     ].map((opt) => {
                        const selected = wsValue === opt.value;
                        const locked = PREMIUM_VALUES.has(opt.value) && !isVip;
                        return (
                           <button
                              key={opt.value}
                              type="button"
                              className={
                                 "w-full flex items-center justify-between px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold transition-[background,border-color] cursor-pointer border " +
                                 (selected
                                    ? "bg-white/[0.07] border-white/[0.16] text-white"
                                    : locked
                                       ? "bg-transparent border-transparent text-white/30 hover:bg-white/[0.02]"
                                       : "bg-transparent border-transparent text-white/90 hover:bg-white/[0.045] hover:border-white/[0.10]")
                              }
                              onClick={() => {
                                 if (locked) {
                                    showToast("error", "Premium subscription required");
                                    return;
                                 }
                                 setWsValue(opt.value);
                                 writeWsHostGlobal(opt.value);
                                 setWsOpen(false);
                              }}
                              role="option"
                              aria-selected={selected}
                           >
                              <span>{opt.label}</span>
                              {locked && (
                                 <img
                                    src="/icons/lock.svg"
                                    alt="locked"
                                    width={14}
                                    height={14}
                                    className="opacity-30"
                                 />
                              )}
                           </button>
                        );
                     })}
                  </div>,
                  document.body,
               )
               : null}

            <select id="detailWsServerSelect" className="hidden">
               <option value="__default__">Default</option>
               <option value="ru.webcrystal.sbs">Russia</option>
               <option value="kz.webcrystal.sbs">Kazakhstan</option>
               <option value="ua.webcrystal.sbs">Ukraine</option>
            </select>
         </div>
      </div>
   );
}