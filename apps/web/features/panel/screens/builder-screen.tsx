"use client";

import { useEffect, useState } from "react";

import { BuilderForm } from "../builder/components/builder-form";
import { BuilderToggle } from "../builder/components/builder-toggle";
import { BuildsList } from "../builder/components/builds/builds-list";
import { makeMutex } from "../builder/utils/make-mutex";

export function BuilderScreen() {
   const [open, setOpen] = useState(false);
   const [mutex] = useState(() => makeMutex());
   const [hasCustomBg, setHasCustomBg] = useState(false);

   useEffect(() => {
      const sync = () => {
         try {
            const cls = document.body.classList;
            setHasCustomBg(cls.contains("hasCustomBg") && cls.contains("isBuilderTab"));
         } catch {
            setHasCustomBg(false);
         }
      };

      sync();
      try {
         const obs = new MutationObserver(sync);
         obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
         return () => obs.disconnect();
      } catch {
         return;
      }
   }, []);

   return (
      <div id="builderView" className="view h-full overflow-auto">
         <div
            className={
               hasCustomBg
                  ? "builderPage mx-auto mt-[20px] mb-[24px] w-full max-w-[1040px] rounded-[18px] bg-[rgba(0,0,0,0.22)] px-[24px]"
                  : "builderPage mx-auto mt-[20px] mb-[24px] w-full max-w-[1040px] px-[24px]"
            }
         >
            <BuilderToggle open={open} onToggle={() => setOpen((v) => !v)} />
            <BuilderForm open={open} mutex={mutex} />

            <BuildsList />

            <div id="buildModal" className="buildModal fixed inset-0 z-[999] grid place-items-center bg-[rgba(0,0,0,0.65)]" hidden>
               <div
                  className="buildModalInner grid w-[min(760px,92vw)] grid-rows-[38px_1fr] rounded-[16px] border border-[rgba(255,255,255,0.18)] bg-[rgba(32,32,32,0.64)] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[10px]"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Build saved"
               >
                  <div className="buildModalTop flex items-center justify-between px-[12px]">
                     <div className="buildModalTopTitle text-[13px] font-bold text-[rgba(255,255,255,0.92)]">build ready</div>
                     <button
                        id="buildModalClose"
                        className="buildModalClose grid h-[26px] w-[26px] place-items-center rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.35)] text-[18px] font-bold leading-none text-[rgba(255,255,255,0.92)]"
                        type="button"
                        aria-label="Close"
                     >
                        ×
                     </button>
                  </div>
                  <div className="buildModalBody grid place-items-center gap-[10px] p-[18px]">
                     <div className="buildModalTitle text-[18px] font-black text-[rgba(255,255,255,0.92)]">BUILD SAVED</div>
                     <div className="buildModalSub text-[12px] font-bold text-[rgba(255,255,255,0.72)]">ARCHIVE PASSWORD :</div>
                     <div id="buildModalPass" className="buildModalPass rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.35)] px-[16px] py-[10px] font-mono text-[14px] font-black text-[rgba(255,255,255,0.92)]">
                        ----
                     </div>
                     <button
                        id="buildModalOk"
                        className="buildModalOk mt-[4px] h-[34px] rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] px-[18px] text-[12px] font-extrabold text-[rgba(255,255,255,0.92)]"
                        type="button"
                     >
                        OK
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}