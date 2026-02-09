"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";
import { createPortal } from "react-dom";

import { WS_OPTIONS, wsLabel } from "./ws-options";

function navigateToHost(host: string) {
   try {
      const cleaned = String(host || "").trim();
      if (!cleaned || cleaned === "__default__") {
         window.location.reload();
         return;
      }

      const proto = window.location.protocol || "https:";
      const path = window.location.pathname + window.location.search + window.location.hash;
      const target = `${proto}//${cleaned}${path}`;
      window.location.replace(target);
   } catch {
      try {
         window.location.reload();
      } catch {
      }
   }
}

export function WsServerSelect(props: {
   setWsHost: (host: string) => void;
   wsSelectValue: string;
   wsWrapRef: RefObject<HTMLDivElement | null>;
   wsBtnRef: RefObject<HTMLButtonElement | null>;
   wsMenuRef: RefObject<HTMLDivElement | null>;
   wsOpen: boolean;
   setWsOpen: Dispatch<SetStateAction<boolean>>;
   wsMenuPos: { left: number; top: number; width: number } | null;
}) {
   const { setWsHost, wsSelectValue, wsWrapRef, wsBtnRef, wsMenuRef, wsOpen, setWsOpen, wsMenuPos } = props;

   return (
      <div ref={wsWrapRef} className="relative min-w-[220px]">
         <select
            id="settingsWsServer"
            className="absolute inset-0 opacity-0 pointer-events-none"
            value={wsSelectValue}
            onChange={(e) => {
               setWsHost(e.target.value);
               try {
                  window.setTimeout(() => navigateToHost(e.target.value), 60);
               } catch {
               }
            }}
            aria-hidden
            tabIndex={-1}
         >
            {WS_OPTIONS.map((o) => (
               <option key={o.value} value={o.value}>
                  {o.label}
               </option>
            ))}
         </select>

         <button
            ref={wsBtnRef}
            type="button"
            className={
               "w-full h-[34px] px-[12px] pr-[32px] rounded-[12px] border border-white/[0.12] bg-white/[0.03] text-[13px] font-semibold text-white/[0.92] cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-[border-color,background,transform] " +
               (wsOpen ? "border-white/[0.22] bg-white/[0.05]" : "hover:bg-white/[0.045] hover:border-white/[0.18]")
            }
            onClick={() => setWsOpen((v) => !v)}
         >
            {wsLabel(wsSelectValue)}
            <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
               <img
                  src="/icons/arrow.svg"
                  alt="v"
                  draggable={false}
                  className={"h-[10px] w-[10px] invert opacity-85 transition-transform " + (wsOpen ? "rotate-180" : "")}
               />
            </span>
         </button>

         {wsOpen && wsMenuPos
            ? createPortal(
               <div
                  ref={wsMenuRef}
                  className="fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
                  style={{ left: wsMenuPos.left, top: wsMenuPos.top, width: wsMenuPos.width }}
                  role="listbox"
               >
                  {WS_OPTIONS.map((opt) => {
                     const selected = wsSelectValue === opt.value;
                     return (
                        <button
                           key={opt.value}
                           type="button"
                           className={
                              "w-full text-left px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold text-white/90 transition-[background,border-color] cursor-pointer border " +
                              (selected
                                 ? "bg-white/[0.07] border-white/[0.16] text-white"
                                 : "bg-transparent border-transparent hover:bg-white/[0.045] hover:border-white/[0.10]")
                           }
                           onClick={() => {
                              setWsHost(opt.value);
                              setWsOpen(false);
                              try {
                                 window.setTimeout(() => navigateToHost(opt.value), 60);
                              } catch {
                              }
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
      </div>
   );
}