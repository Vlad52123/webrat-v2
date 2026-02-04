import { createElement, useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
   ttlMs?: number;
};

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
               "wc-toast toast--show relative w-[280px] overflow-hidden rounded-[12px] border border-white/[0.16] bg-[rgba(18,18,18,0.86)] px-[14px] py-[10px] text-[13px] text-white/[0.96] shadow-[0_12px_28px_rgba(0,0,0,0.55)] backdrop-blur-[6px]" +
               (hiding ? " toast--hide" : ""),
            style: ({ "--wc-toast-ttl": `${ttlMs}ms` } as unknown as CSSProperties),
         },
         createElement("div", {
            className: "absolute left-0 top-0 bottom-0 w-[4px] opacity-95",
            style: { background: barBg },
         }),
         createElement(
            "div",
            {
               className:
                  "w-full border-b px-2 pb-1 text-left text-[14px] font-extrabold uppercase tracking-[0.06em] text-white whitespace-nowrap overflow-hidden text-ellipsis",
               style: { borderBottomColor },
            },
            String(title || ""),
         ),
         createElement(
            "div",
            {
               className: "w-full mt-1 px-2 text-left text-[14px] text-white/[0.92] leading-[1.25] max-h-[calc(1.25em*2)] overflow-hidden",
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

export function showToast(typeOrTitle: string, message?: string, opts?: ToastOptions) {
   try {
      if (typeof window === "undefined") return;

      const type = normalizeType(typeOrTitle);
      const title = type === "info" && typeOrTitle && typeOrTitle.toLowerCase() !== "info" ? typeOrTitle : type;
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