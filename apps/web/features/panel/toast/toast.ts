import { createElement, useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
   ttlMs?: number;
};

const MAX_TOASTS = 6;
const TOAST_IN_MS = 280;

let toastQueue: Array<{ typeOrTitle: string; message?: string; opts?: ToastOptions }> = [];
let toastShowing = false;

function countVisibleToasts(): number {
   try {
      if (typeof document === "undefined") return 0;
      return document.querySelectorAll(".wc-toast-shell").length;
   } catch {
      return 0;
   }
}

function WcToastView(props: {
   id: string | number;
   type: ToastType;
   title: string;
   message: string;
   ttlMs: number;
}) {
   const { id, type, title, message, ttlMs } = props;

   const [hiding, setHiding] = useState(false);

   const accent = useMemo(() => {
      if (type === "success") return "#2ecc71";
      if (type === "error") return "#ff4b4b";
      if (type === "warning") return "#f1c40f";
      return "#3498db";
   }, [type]);

   const glow = useMemo(() => {
      if (type === "success") return "rgba(46, 204, 113, 0.28)";
      if (type === "error") return "rgba(255, 75, 75, 0.32)";
      if (type === "warning") return "rgba(241, 196, 15, 0.28)";
      return "rgba(127, 92, 255, 0.30)";
   }, [type]);

   const titleText = useMemo(() => {
      const t = String(title || "").trim();
      if (t === "success") return "SUCCESS";
      if (t === "error") return "ERROR";
      if (t === "warning") return "WARNING";
      if (t === "info") return "INFO";
      return t || "INFO";
   }, [title]);

   const borderBottomColor = useMemo(() => {
      if (type === "success") return "rgba(46, 204, 113, 0.4)";
      if (type === "error") return "rgba(255, 75, 75, 0.45)";
      if (type === "warning") return "rgba(241, 196, 15, 0.45)";
      return "rgba(52, 152, 219, 0.45)";
   }, [type]);

   useEffect(() => {
      const exitMs = 320;
      const visibleMs = Number.isFinite(ttlMs) ? ttlMs : 4200;
      const t = window.setTimeout(() => setHiding(true), Math.max(0, visibleMs));
      return () => window.clearTimeout(t);
   }, [ttlMs]);

   useEffect(() => {
      if (!hiding) return;
      const t = window.setTimeout(() => {
         try {
            toast.dismiss(id);
            flushToastQueue();
         } catch {
         }
      }, 320);
      return () => window.clearTimeout(t);
   }, [hiding, id]);

   return createElement(
      "div",
      {
         className: "wc-toast-shell pointer-events-auto",
         onClick: () => {
            try {
               setHiding(true);
            } catch {
            }
         },
      },
      createElement(
         "div",
         {
            className:
               "wc-toast toast--show relative w-[320px] overflow-hidden rounded-[14px] border border-white/[0.16] bg-[linear-gradient(180deg,rgba(35,18,65,0.88)_0%,rgba(12,10,20,0.82)_100%)] px-[14px] py-[12px] text-[13px] text-white/[0.96] shadow-[0_18px_46px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-[10px]" +
               (hiding ? " toast--hide" : ""),
            style: ({ "--wc-toast-ttl": `${ttlMs}ms` } as unknown as CSSProperties),
         },
         createElement("div", {
            className: "absolute left-0 top-0 bottom-0 w-[4px] opacity-95",
            style: { background: accent },
            "aria-hidden": "true",
         }),
         createElement("div", {
            className: "absolute -inset-[40px] opacity-100",
            style: {
               background: `radial-gradient(closest-side, ${glow} 0%, rgba(0,0,0,0) 70%)`,
               filter: "blur(16px)",
            },
            "aria-hidden": "true",
         }),
         createElement(
            "div",
            { className: "relative" },
            createElement(
               "div",
               {
                  className: "grid gap-0",
               },
               createElement(
                  "div",
                  { className: "min-w-0" },
                  createElement(
                     "div",
                     {
                        className:
                           "w-full border-b pb-[6px] pl-[10px] text-left text-[12px] font-extrabold uppercase tracking-[0.16em] text-white/95 whitespace-nowrap overflow-hidden text-ellipsis",
                        style: { borderBottomColor },
                     },
                     titleText,
                  ),
                  createElement(
                     "div",
                     {
                        className:
                           "w-full mt-[6px] pl-[10px] text-left text-[14px] font-semibold text-white/[0.92] leading-[1.22] max-h-[calc(1.22em*2)] overflow-hidden",
                     },
                     message,
                  ),
               ),
            ),
         ),
      ),
   );
}

function normalizeType(type: string): ToastType {
   const t = String(type || "").toLowerCase();
   if (t === "success" || t === "error" || t === "warning" || t === "info") return t;
   if (t === "warn") return "warning";
   return "info";
}

function showToastImmediate(typeOrTitle: string, message?: string, opts?: ToastOptions) {
   try {
      if (typeof window === "undefined") return;

      const raw = String(typeOrTitle || "").trim();
      const type = normalizeType(raw);
      const rawLower = raw.toLowerCase();
      const title = raw && rawLower === type ? raw : type === "info" && raw && rawLower !== "info" ? raw : type;
      const msg = message != null ? String(message) : "";

      const ttl = typeof opts?.ttlMs === "number" ? opts.ttlMs : 4200;
      const exitMs = 320;

      toast.custom(
         (id: string | number) => createElement(WcToastView, { id, type, title: String(title || ""), message: msg, ttlMs: ttl }),
         { duration: Math.max(0, ttl) + exitMs },
      );
   } catch {
   }
}

function flushToastQueue() {
   try {
      if (typeof window === "undefined") return;
      if (toastShowing) return;
      if (!toastQueue.length) return;
      if (countVisibleToasts() >= MAX_TOASTS) return;

      toastShowing = true;
      const item = toastQueue.shift();
      if (!item) {
         toastShowing = false;
         return;
      }

      showToastImmediate(item.typeOrTitle, item.message, item.opts);

      window.setTimeout(() => {
         toastShowing = false;
         flushToastQueue();
      }, TOAST_IN_MS);
   } catch {
      toastShowing = false;
   }
}

export function showToast(typeOrTitle: string, message?: string, opts?: ToastOptions) {
   try {
      const visible = countVisibleToasts();
      const queued = toastQueue.length;
      if (visible + queued >= MAX_TOASTS) return;

      toastQueue.push({ typeOrTitle, message, opts });
      flushToastQueue();
   } catch {
   }
}

declare global {
   interface Window {
      WebRatCommon?: { showToast?: (type: string, message: string) => void };
   }
}

export function installToastGlobal() {
   try {
      if (typeof window === "undefined") return;
      if ((window as unknown as { __webratToastInstalled?: boolean }).__webratToastInstalled) return;
      (window as unknown as { __webratToastInstalled?: boolean }).__webratToastInstalled = true;

      window.WebRatCommon = window.WebRatCommon || {};
      window.WebRatCommon.showToast = (type: string, message: string) => showToast(type, message);

      window.addEventListener("error", (e) => {
         try {
            const msg = e && (e as unknown as { message?: unknown }).message ? String((e as unknown as { message?: unknown }).message) : "Script error";
            window.WebRatCommon?.showToast?.("error", msg);
         } catch {
         }
      });

      window.addEventListener("unhandledrejection", (e) => {
         try {
            const reason = (e as unknown as { reason?: unknown }).reason;
            const msg =
               typeof reason === "object" && reason && "message" in reason
                  ? String((reason as { message?: unknown }).message)
                  : reason != null
                     ? String(reason)
                     : "Unhandled rejection";
            window.WebRatCommon?.showToast?.("error", msg);
         } catch {
         }
      });
   } catch {
   }
}