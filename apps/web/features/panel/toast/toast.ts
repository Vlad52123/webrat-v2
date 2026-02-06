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

   const { barBg, borderBottomColor } = useMemo(() => {
      const bar =
         type === "success" ? "#2ecc71" : type === "error" ? "#ff4b4b" : type === "warning" ? "#8b5cf6" : "#3498db";
      const border =
         type === "success"
            ? "rgba(46, 204, 113, 0.4)"
            : type === "error"
               ? "rgba(255, 75, 75, 0.45)"
               : type === "warning"
                  ? "rgba(139, 92, 246, 0.45)"
                  : "rgba(52, 152, 219, 0.45)";
      return { barBg: bar, borderBottomColor: border };
   }, [type]);

   const icon = useMemo(() => {
      const common = {
         width: 16,
         height: 16,
         viewBox: "0 0 24 24",
         fill: "none",
         xmlns: "http://www.w3.org/2000/svg",
      };

      if (type === "success") {
         return createElement(
            "svg",
            { ...common },
            createElement("path", {
               d: "M20 6L9 17l-5-5",
               stroke: "currentColor",
               strokeWidth: 2.2,
               strokeLinecap: "round",
               strokeLinejoin: "round",
            }),
         );
      }
      if (type === "error") {
         return createElement(
            "svg",
            { ...common },
            createElement("path", {
               d: "M18 6L6 18",
               stroke: "currentColor",
               strokeWidth: 2.2,
               strokeLinecap: "round",
            }),
            createElement("path", {
               d: "M6 6l12 12",
               stroke: "currentColor",
               strokeWidth: 2.2,
               strokeLinecap: "round",
            }),
         );
      }
      if (type === "warning") {
         return createElement(
            "svg",
            { ...common },
            createElement("path", {
               d: "M12 9v4",
               stroke: "currentColor",
               strokeWidth: 2.2,
               strokeLinecap: "round",
            }),
            createElement("path", {
               d: "M12 17h.01",
               stroke: "currentColor",
               strokeWidth: 3,
               strokeLinecap: "round",
            }),
            createElement("path", {
               d: "M10.3 4.6l-8 14A2 2 0 004 22h16a2 2 0 001.7-3.4l-8-14a2 2 0 00-3.4 0z",
               stroke: "currentColor",
               strokeWidth: 2.2,
               strokeLinejoin: "round",
            }),
         );
      }
      return createElement(
         "svg",
         { ...common },
         createElement("path", {
            d: "M12 16v-4",
            stroke: "currentColor",
            strokeWidth: 2.2,
            strokeLinecap: "round",
         }),
         createElement("path", {
            d: "M12 8h.01",
            stroke: "currentColor",
            strokeWidth: 3,
            strokeLinecap: "round",
         }),
         createElement("path", {
            d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
            stroke: "currentColor",
            strokeWidth: 2.2,
            strokeLinejoin: "round",
         }),
      );
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
               "wc-toast toast--show relative w-[292px] overflow-hidden rounded-[16px] border border-white/[0.16] bg-[radial-gradient(130%_160%_at_0%_0%,rgba(255,255,255,0.10),rgba(255,255,255,0)_58%),linear-gradient(180deg,rgba(18,18,18,0.92),rgba(14,14,14,0.86))] px-[12px] py-[10px] text-[13px] text-white/[0.96] shadow-[0_18px_56px_rgba(0,0,0,0.70)] backdrop-blur-[12px]" +
               (hiding ? " toast--hide" : ""),
            style: ({ "--wc-toast-ttl": `${ttlMs}ms` } as unknown as CSSProperties),
         },
         createElement("div", {
            className: "absolute left-0 top-0 bottom-0 w-[3px] opacity-95",
            style: { background: barBg },
         }),
         createElement(
            "div",
            { className: "relative" },
            createElement(
               "div",
               {
                  className: "flex items-start gap-[10px]",
               },
               createElement(
                  "div",
                  {
                     className:
                        "mt-[1px] grid h-[28px] w-[28px] flex-none place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06]",
                     style: { color: barBg },
                     "aria-hidden": "true",
                  },
                  icon,
               ),
               createElement(
                  "div",
                  { className: "min-w-0 flex-1" },
                  createElement(
                     "div",
                     {
                        className:
                           "w-full border-b pb-[6px] pr-[24px] text-left text-[12px] font-extrabold uppercase tracking-[0.10em] text-white/90 whitespace-nowrap overflow-hidden text-ellipsis",
                        style: { borderBottomColor },
                     },
                     String(title || ""),
                  ),
                  createElement(
                     "div",
                     {
                        className:
                           "w-full mt-[6px] text-left text-[13px] text-white/[0.92] leading-[1.25] max-h-[calc(1.25em*3)] overflow-hidden",
                     },
                     message,
                  ),
               ),
               createElement(
                  "button",
                  {
                     type: "button",
                     className:
                        "absolute right-[6px] top-[2px] grid h-[22px] w-[22px] place-items-center rounded-[8px] border border-white/[0.10] bg-white/[0.03] text-[16px] leading-none text-white/80 transition-[background,border-color,transform] hover:bg-white/[0.07] hover:border-white/[0.16] active:translate-y-[1px]",
                     "aria-label": "Dismiss",
                     onClick: (e: unknown) => {
                        try {
                           if (e && typeof e === "object" && "stopPropagation" in e && typeof (e as { stopPropagation?: unknown }).stopPropagation === "function") {
                              (e as { stopPropagation: () => void }).stopPropagation();
                           }
                        } catch {
                        }
                        try {
                           setHiding(true);
                        } catch {
                        }
                     },
                  },
                  "×",
               ),
            ),
         ),
         createElement("div", {
            className: "wc-toast-progress absolute left-0 right-0 bottom-0 h-[2px] opacity-90",
            style: { background: barBg },
            "aria-hidden": "true",
         }),
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