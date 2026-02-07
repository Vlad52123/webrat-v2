"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";
import { createPortal } from "react-dom";

import { WS_OPTIONS, wsLabel } from "./ws-options";

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
      <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
         <div className="text-[14px] font-semibold text-white">Default WS server</div>
         <div ref={wsWrapRef} className="relative min-w-[220px]">
            <select
               id="settingsWsServer"
               className="absolute inset-0 opacity-0 pointer-events-none"
               value={wsSelectValue}
               onChange={(e) => {
                  setWsHost(e.target.value);
                  try {
                     window.setTimeout(() => window.location.reload(), 60);
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
                  "w-full h-[34px] px-[12px] pr-[32px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] text-[13px] text-white/[0.92] cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-[border-color,background,box-shadow,transform] " +
                  (wsOpen ? "border-white/[0.30] shadow-[0_0_0_3px_rgba(80,230,255,0.12)]" : "hover:bg-white/[0.06] hover:border-white/[0.22]")
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
                     className="fixed z-[9999] rounded-[14px] border border-white/[0.14] bg-[rgba(12,12,12,0.96)] p-[8px] text-white shadow-[0_22px_54px_rgba(0,0,0,0.65)]"
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
                                 "w-full text-left px-[10px] py-[10px] rounded-[12px] text-[13px] leading-[1.15] font-semibold text-white transition-[background,transform] cursor-pointer " +
                                 (selected
                                    ? "bg-[rgba(80,230,255,0.12)] border border-[rgba(80,230,255,0.20)]"
                                    : "bg-transparent hover:bg-white/[0.08]")
                              }
                              onClick={() => {
                                 setWsHost(opt.value);
                                 setWsOpen(false);
                                 try {
                                    window.setTimeout(() => window.location.reload(), 60);
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
      </div>
   );
}