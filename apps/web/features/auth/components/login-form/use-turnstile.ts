import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
   render?: (container: HTMLElement, options: Record<string, unknown>) => unknown;
   remove?: (widgetId: unknown) => void;
};

export function useTurnstile(p: {
   useTurnstile: boolean;
   setCaptchaReady: (v: boolean) => void;
}) {
   const { useTurnstile, setCaptchaReady } = p;

   const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
   const turnstileWidgetIdRef = useRef<unknown>(null);
   const [turnstileToken, setTurnstileToken] = useState("");

   useEffect(() => {
      if (!useTurnstile) {
         setTurnstileToken("");
         setCaptchaReady(false);

         try {
            const w = window as unknown as { turnstile?: TurnstileApi };
            if (turnstileWidgetIdRef.current && w.turnstile?.remove) {
               w.turnstile.remove(turnstileWidgetIdRef.current);
            }
         } catch {
         }

         turnstileWidgetIdRef.current = null;
         if (turnstileContainerRef.current) {
            turnstileContainerRef.current.innerHTML = "";
         }
         return;
      }

      const w = window as unknown as { turnstile?: TurnstileApi };

      const existing = document.querySelector('script[data-cf-turnstile="true"]');
      if (!existing) {
         const s = document.createElement("script");
         s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
         s.async = true;
         s.defer = true;
         s.dataset.cfTurnstile = "true";
         document.head.appendChild(s);
      }

      let cancelled = false;
      const t = window.setInterval(() => {
         if (cancelled) return;
         if (!w.turnstile?.render) return;

         const el = turnstileContainerRef.current;
         if (!el) return;

         try {
            if (turnstileWidgetIdRef.current && w.turnstile.remove) {
               w.turnstile.remove(turnstileWidgetIdRef.current);
            }
         } catch {
         }

         turnstileWidgetIdRef.current = null;
         el.innerHTML = "";
         setTurnstileToken("");
         setCaptchaReady(false);

         turnstileWidgetIdRef.current = w.turnstile.render(el, {
            sitekey: "0x4AAAAAACMVXs8AFwjPiMKT",
            theme: "dark",
            callback: (token: string) => {
               setTurnstileToken(String(token || ""));
               setCaptchaReady(true);
            },
            "error-callback": () => {
               setTurnstileToken("");
               setCaptchaReady(false);
            },
            "expired-callback": () => {
               setTurnstileToken("");
               setCaptchaReady(false);
            },
         });

         window.clearInterval(t);
      }, 50);

      return () => {
         cancelled = true;
         window.clearInterval(t);
      };
   }, [setCaptchaReady, useTurnstile]);

   return {
      turnstileContainerRef,
      turnstileToken,
      setTurnstileToken,
   };
}