"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Victim } from "../../../api/victims";

function Row(props: { label: string; value: string }) {
   const { label, value } = props;
   return (
      <>
         <div className="text-[15px] font-semibold text-white/90">{label}</div>
         <div className="text-[15px] font-medium text-white/95">{value}</div>
      </>
   );
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
      <div className="detail-section">
         <div
            className={
               "w-[600px] max-w-[min(920px,calc(100vw-260px))] rounded-[18px] border border-[rgba(130,130,130,0.75)] " +
               "bg-[rgba(18,18,18,0.66)] p-[16px_18px_18px] shadow-[0_0_0_1px_rgba(0,0,0,0.7),0_20px_46px_rgba(0,0,0,0.85)] backdrop-blur-[14px]"
            }
         >
            <header className="flex items-center justify-between">
               <h2 className="text-[20px] font-extrabold text-white/95">PC info</h2>
               <button
                  id="pcInfoReload"
                  className="grid h-[34px] w-[34px] place-items-center rounded-[12px] border border-white/15 bg-white/5 transition-colors hover:bg-white/10"
                  type="button"
                  aria-label="Reload PC info"
               >
                  <Image src="/icons/reload.svg" alt="reload" width={18} height={18} draggable={false} className="opacity-90 invert" />
               </button>
            </header>

            <div className="my-[10px] h-[1px] w-full bg-white/10" />

            <div className="grid grid-cols-[180px_1fr] gap-x-[12px] gap-y-[8px]">
               <Row label="Username:" value={victim?.user ?? ""} />
               <Row label="PC-name:" value={victim?.hostname ?? ""} />
               <Row label="Ip:" value={victim?.ip ?? ""} />
               <Row label="Location:" value={victim?.country ?? ""} />
               <Row label="Active window:" value={victim?.window ?? ""} />
               <Row label="System:" value={victim?.os ?? ""} />
               <Row label="Last active:" value={String(victim?.last_active ?? "")} />
               <Row label="Admin rights:" value={victim?.admin ? "True" : "False"} />
               <Row label="CPU:" value={victim?.cpu ?? ""} />
               <Row label="GPU:" value={victim?.gpu ?? ""} />
               <Row label="Ram:" value={victim?.ram ?? ""} />
               <Row label="Comment:" value={victim?.comment ?? ""} />
            </div>

            <header className="mt-[16px] flex items-center justify-between">
               <h2 className="text-[20px] font-extrabold text-white/95">Build info</h2>
            </header>

            <div className="my-[10px] h-[1px] w-full bg-white/10" />

            <div className="grid grid-cols-[180px_1fr] gap-x-[12px] gap-y-[8px]">
               <Row label="Build version:" value={""} />
               <Row label="Startup delay (sec):" value={""} />
               <Row label="Autorun:" value={""} />
               <Row label="Path:" value={""} />
               <Row label="Hide file:" value={""} />
            </div>
         </div>
      </div>
   );
}