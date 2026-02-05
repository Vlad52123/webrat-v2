"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { installToastGlobal } from "../features/panel/toast";

export function Providers({ children }: { children: React.ReactNode }) {
   const [queryClient] = useState(() => new QueryClient());

   useEffect(() => {
      try {
         const apply = (low: boolean) => {
            try {
               document.documentElement.classList.toggle("lowPerf", low);
            } catch {
            }
         };

         let forced: boolean | null = null;
         try {
            const v = localStorage.getItem("webrat_low_perf");
            if (v === "1" || v === "true" || v === "on") forced = true;
            if (v === "0" || v === "false" || v === "off") forced = false;
         } catch {
         }

         let low = false;
         try {
            const hc = (navigator as unknown as { hardwareConcurrency?: unknown }).hardwareConcurrency;
            if (typeof hc === "number" && Number.isFinite(hc) && hc > 0 && hc <= 4) low = true;
         } catch {
         }
         try {
            const dm = (navigator as unknown as { deviceMemory?: unknown }).deviceMemory;
            if (typeof dm === "number" && Number.isFinite(dm) && dm > 0 && dm <= 4) low = true;
         } catch {
         }
         try {
            if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
               if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) low = true;
               const m = window.matchMedia("(prefers-reduced-transparency: reduce)");
               if (m && "matches" in m && m.matches) low = true;
            }
         } catch {
         }

         if (forced != null) {
            apply(forced);
            return;
         }

         apply(low);

         let raf = 0;
         let frames = 0;
         let start = 0;
         const tick = (ts: number) => {
            frames += 1;
            if (!start) start = ts;
            const elapsed = ts - start;
            if (elapsed < 1200) {
               raf = window.requestAnimationFrame(tick);
               return;
            }

            const fps = frames / (elapsed / 1000);
            if (Number.isFinite(fps) && fps > 0 && fps < 50) {
               apply(true);
            }
         };
         raf = window.requestAnimationFrame(tick);
         return () => {
            try {
               if (raf) window.cancelAnimationFrame(raf);
            } catch {
            }
         };
      } catch {
      }
   }, []);

   useEffect(() => {
      let cancelled = false;
      (async () => {
         try {
            await fetch("/api/health", { method: "GET", credentials: "include" });
         } catch {
            return;
         }
         if (cancelled) return;
      })();
      return () => {
         cancelled = true;
      };
   }, []);

   useEffect(() => {
      try {
         installToastGlobal();
      } catch {
      }
   }, []);

   useEffect(() => {
      const apply = () => {
         const nodes = Array.from(
            document.querySelectorAll(
               "[data-sonner-toaster],[data-sonner-toast],[data-sonner-close-button],[data-sonner-description],[data-sonner-title]",
            ),
         ) as HTMLElement[];

         if (!nodes.length) return false;

         const patch = (el: HTMLElement) => {
            try {
               el.style.setProperty("--offset", "0px");
               el.style.setProperty("--mobile-offset", "0px");
               el.style.setProperty("--viewport-padding", "0px");
            } catch {
            }
            try {
               const cs = window.getComputedStyle(el);
               if (cs.position === "fixed") {
                  el.style.position = "fixed";
                  el.style.right = "0";
                  el.style.bottom = "0";
                  el.style.top = "auto";
                  el.style.left = "auto";
                  el.style.inset = "auto 0 0 auto";
                  el.style.margin = "0";
                  el.style.padding = "0";
                  el.style.transform = "none";
               }
            } catch {
            }
         };

         for (const n of nodes) {
            let cur: HTMLElement | null = n;
            let steps = 0;
            while (cur && cur !== document.body && steps < 6) {
               patch(cur);
               cur = cur.parentElement;
               steps += 1;
            }
         }

         try {
            const toaster = document.querySelector("[data-sonner-toaster]") as HTMLElement | null;
            const list = (toaster?.querySelector("ol, ul") as HTMLElement | null) ?? null;
            if (list) {
               list.style.margin = "0";
               list.style.padding = "0";
            }
         } catch {
         }

         return true;
      };

      if (apply()) return;

      const obs = new MutationObserver(() => {
         apply();
      });

      try {
         obs.observe(document.body, { childList: true, subtree: true });
      } catch {
      }

      return () => {
         try {
            obs.disconnect();
         } catch {
         }
      };
   }, []);

   return (
      <QueryClientProvider client={queryClient}>
         <Toaster position="bottom-right" expand visibleToasts={6} offset={0} />
         {children}
      </QueryClientProvider>
   );
}