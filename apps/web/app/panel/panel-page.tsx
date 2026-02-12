"use client";

import { useEffect, useRef, useState } from "react";

import { PanelShell } from "../../features/panel/components/panel-shell";

export function PanelPage() {
   const [isReady, setIsReady] = useState(false);
   const [isChecking, setIsChecking] = useState(true);
   const didRedirect = useRef(false);

   useEffect(() => {
      let cancelled = false;

      (async () => {
         try {
            const res = await fetch(`/api/me`, {
               method: "GET",
               credentials: "include",
            });
            if (cancelled) return;

            if (!res.ok) {
               if (!didRedirect.current) {
                  didRedirect.current = true;
                  window.location.href = "/login/";
               }
               return;
            }

            const finish = () => {
               setIsReady(true);
               setIsChecking(false);
            };

            const remaining = 1000 - (Date.now() % 1000);
            if (remaining > 50) {
               window.setTimeout(finish, remaining);
            } else {
               finish();
            }
         } catch {
            if (cancelled) return;
            if (!didRedirect.current) {
               didRedirect.current = true;
               window.location.href = "/login/";
            }
         }
      })();

      return () => {
         cancelled = true;
      };
   }, []);

   if (!isReady) {
      return (
         <div className="grid min-h-screen place-items-center bg-[#181818]">
            <div className="grid place-items-center gap-[16px]">
               <div className="relative grid h-[64px] w-[64px] place-items-center">
                  <div className="absolute inset-0 rounded-full border-[2px] border-[rgba(255,255,255,0.06)]" />
                  <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[rgba(255,255,255,0.35)] animate-spin" />
                  <img
                     src="/logo/main_logo.ico"
                     alt=""
                     draggable={false}
                     className="h-[28px] w-[28px] rounded-[6px] opacity-60"
                     style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                  />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.25)]">
                  {isChecking ? "Checking session" : "Redirecting"}
               </span>
            </div>
         </div>
      );
   }

   return <PanelShell />;
}