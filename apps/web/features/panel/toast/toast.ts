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

const TOAST_ICONS: Record<ToastType, string> = {
   success: "✓",
   error: "✕",
   warning: "!",
   info: "i",
};

const TOAST_ICON_BG: Record<ToastType, string> = {
   success: "rgba(46,204,113,0.15)",
   error: "rgba(255,75,75,0.15)",
   warning: "rgba(241,196,15,0.15)",
   info: "rgba(52,152,219,0.15)",
};

const TOAST_ICON_COLOR: Record<ToastType, string> = {
   success: "rgb(78,233,122)",
   error: "rgb(255,90,90)",
   warning: "rgb(245,210,60)",
   info: "rgb(100,180,255)",
};

const TOAST_BORDER: Record<ToastType, string> = {
   success: "rgba(46,204,113,0.12)",
   error: "rgba(255,75,75,0.14)",
   warning: "rgba(241,196,15,0.12)",
   info: "rgba(52,152,219,0.12)",
};

function WcToastView(props: {
   id: string | number;
   type: ToastType;
   title: string;
   message: string;
   ttlMs: number;
}) {
   const { id, type, message, ttlMs } = props;

   const [hiding, setHiding] = useState(false);

   useEffect(() => {
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
         className: "wc-toast-shell pointer-events-auto cursor-pointer",
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
               "wc-toast toast--show flex items-center gap-[10px] w-[280px] overflow-hidden rounded-[12px] border bg-[rgba(16,16,20,0.94)] px-[12px] py-[10px] shadow-[0_8px_28px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-[12px]" +
               (hiding ? " toast--hide" : ""),
            style: ({
               "--wc-toast-ttl": `${ttlMs}ms`,
               borderColor: TOAST_BORDER[type],
            } as unknown as CSSProperties),
         },
         // icon circle
         createElement(
            "div",
            {
               className: "flex-shrink-0 grid place-items-center w-[28px] h-[28px] rounded-[8px] text-[13px] font-black",
               style: {
                  background: TOAST_ICON_BG[type],
                  color: TOAST_ICON_COLOR[type],
               },
            },
            TOAST_ICONS[type],
         ),
         // text content
         createElement(
            "div",
            { className: "min-w-0 flex-1" },
            createElement(
               "div",
               {
                  className: "text-[12px] font-semibold text-[rgba(255,255,255,0.88)] leading-[1.35] overflow-hidden",
                  style: {
                     display: "-webkit-box",
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: "vertical" as const,
                  },
               },
               message,
            ),
         ),
         // progress bar at bottom
         createElement("div", {
            className: "wc-toast-progress absolute left-0 bottom-0 h-[2px] w-full opacity-40",
            style: { background: TOAST_ICON_COLOR[type] },
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