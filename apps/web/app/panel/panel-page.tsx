"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PanelShell } from "../../features/panel/components/panel-shell";
import { AppLoader } from "../../features/panel/components/app-loader";

export function PanelPage() {
   const router = useRouter();
   const [isReady, setIsReady] = useState(false);
   const [isChecking, setIsChecking] = useState(true);
   const [readyMinUntilTs] = useState(() => {
      try {
         return Date.now() + 1000;
      } catch {
         return 0;
      }
   });

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
               try {
                  await fetch(`/api/logout`, { method: "POST", credentials: "include" });
               } catch {
               }
               if (typeof window !== "undefined") {
                  window.location.replace("/login");
               } else {
                  router.replace("/login");
               }
               return;
            }
            const finish = () => {
               setIsReady(true);
               setIsChecking(false);
            };

            const remaining = readyMinUntilTs ? readyMinUntilTs - Date.now() : 0;
            if (remaining > 0) {
               window.setTimeout(finish, remaining);
            } else {
               finish();
            }
         } catch {
            if (cancelled) return;
            try {
               await fetch(`/api/logout`, { method: "POST", credentials: "include" });
            } catch {
            }
            if (typeof window !== "undefined") {
               window.location.replace("/login");
            } else {
               router.replace("/login");
            }
         }
      })();
      return () => {
         cancelled = true;
      };
   }, [readyMinUntilTs, router]);

   if (!isReady) {
      return (
         <AppLoader label={isChecking ? "Checking session" : "Redirecting"} fullScreen />
      );
   }

   return <PanelShell />;
}