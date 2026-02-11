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
         <div className="grid min-h-screen place-items-center bg-[#222222] text-white/80">
            <div className="grid place-items-center">
               <img
                  src="/icons/loading.svg"
                  alt="loading"
                  draggable={false}
                  className="h-[44px] w-[44px] animate-spin invert brightness-200"
               />
               <span className="sr-only">{isChecking ? "Checking session" : "Redirecting"}</span>
            </div>
         </div>
      );
   }

   return <PanelShell />;
}