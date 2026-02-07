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

   const { accent, labelColor } = useMemo(() => {
      const a =
         type === "success" ? "#2ecc71" : type === "error" ? "#ff4b4b" : type === "warning" ? "#8b5cf6" : "#3498db";
      const lc =
         type === "success"
            ? "rgba(46, 204, 113, 0.85)"
            : type === "error"
               ? "rgba(255, 75, 75, 0.90)"
               : type === "warning"
                  ? "rgba(139, 92, 246, 0.90)"
                  : "rgba(52, 152, 219, 0.90)";
      return { accent: a, labelColor: lc };
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
               "wc-toast toast--show relative w-[300px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] px-[14px] py-[12px] text-[13px] text-white/[0.96] shadow-[0_18px_44px_rgba(0,0,0,0.60),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]" +
               (hiding ? " toast--hide" : ""),
            style: ({ "--wc-toast-ttl": `${ttlMs}ms` } as unknown as CSSProperties),
         },
         createElement("div", {
            className: "pointer-events-none absolute left-0 right-0 top-0 h-[2px] opacity-95",
            style: { background: "var(--line)" },
            "aria-hidden": "true",
         }),
         createElement(
            "div",
            { className: "relative" },
            createElement(
               "div",
               {
                  className: "flex items-start gap-[10px]",
               },
               createElement("div", {
                  className: "mt-[6px] h-[10px] w-[10px] flex-none rounded-[3px]",
                  style: { background: accent },
                  "aria-hidden": "true",
               }),
               createElement(
                  "div",
                  { className: "min-w-0 flex-1" },
                  createElement(
                     "div",
                     {
                        className:
                           "w-full border-b border-white/[0.12] pb-[6px] pr-[24px] text-left text-[12px] font-extrabold uppercase tracking-[0.10em] whitespace-nowrap overflow-hidden text-ellipsis",
                        style: { color: labelColor },
                     },
                     String(title || ""),
                  ),
                  createElement(
                     "div",
                     {
                        className:
                           "w-full mt-[8px] text-left text-[13px] text-white/[0.92] leading-[1.25] max-h-[calc(1.25em*3)] overflow-hidden",
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
            style: { background: accent },
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