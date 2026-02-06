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
               "wc-toast toast--show relative w-[264px] overflow-hidden rounded-[14px] border border-white/[0.14] bg-[radial-gradient(120%_140%_at_0%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%),rgba(16,16,16,0.88)] px-[8px] py-[9px] text-[13px] text-white/[0.96] shadow-[0_18px_46px_rgba(0,0,0,0.66)] backdrop-blur-[10px]" +
               (hiding ? " toast--hide" : ""),
            style: ({ "--wc-toast-ttl": `${ttlMs}ms` } as unknown as CSSProperties),
         },
         createElement("div", {
            className: "absolute left-0 top-0 bottom-0 w-[3px] opacity-95",
            style: { background: barBg },
         }),
         createElement(
            "div",
            {
               className:
                  "w-full border-b pb-[6px] text-left text-[13px] font-extrabold uppercase tracking-[0.08em] text-white whitespace-nowrap overflow-hidden text-ellipsis",
               style: { borderBottomColor },
            },
            String(title || ""),
         ),
         createElement(
            "div",
            {
               className: "w-full mt-[6px] text-left text-[14px] text-white/[0.92] leading-[1.25] max-h-[calc(1.25em*2)] overflow-hidden",
            },
            message,
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