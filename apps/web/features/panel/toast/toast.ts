export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
  ttlMs?: number;
};

function ensureContainer(): HTMLElement {
  const existing = document.getElementById("toastContainer");
  if (existing) return existing;

  const el = document.createElement("div");
  el.id = "toastContainer";
  el.className =
    "fixed right-[18px] bottom-[14px] z-[2147483647] flex flex-col-reverse gap-2 pointer-events-none";
  document.body.appendChild(el);
  return el;
}

function normalizeType(type: string): ToastType {
  const t = String(type || "").toLowerCase();
  if (t === "success" || t === "error" || t === "warning" || t === "info") return t;
  if (t === "warn") return "warning";
  return "info";
}

export function showToast(typeOrTitle: string, message?: string, opts?: ToastOptions) {
  try {
    const type = normalizeType(typeOrTitle);
    const title = type === "info" && typeOrTitle && typeOrTitle.toLowerCase() !== "info" ? typeOrTitle : type;
    const msg = message != null ? String(message) : "";

    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className =
      "pointer-events-auto relative w-[280px] overflow-hidden rounded-[12px] border border-white/[0.16] bg-[rgba(18,18,18,0.86)] px-[14px] py-[10px] text-[13px] text-white/[0.96] shadow-[0_12px_28px_rgba(0,0,0,0.55)] backdrop-blur-[6px] opacity-0 translate-x-[120%]";

    const bar = document.createElement("div");
    bar.className = "absolute left-0 top-0 bottom-0 w-[4px] opacity-95";
    bar.style.background =
      type === "success" ? "#2ecc71" : type === "error" ? "#ff4b4b" : type === "warning" ? "#8b5cf6" : "#3498db";
    toast.appendChild(bar);

    const top = document.createElement("div");
    top.className =
      "w-full border-b px-2 pb-1 text-left text-[14px] font-extrabold uppercase tracking-[0.06em] text-white whitespace-nowrap overflow-hidden text-ellipsis";
    top.style.borderBottomColor =
      type === "success"
        ? "rgba(46, 204, 113, 0.4)"
        : type === "error"
          ? "rgba(255, 75, 75, 0.45)"
          : type === "warning"
            ? "rgba(139, 92, 246, 0.45)"
            : "rgba(52, 152, 219, 0.45)";
    top.textContent = String(title || "");
    toast.appendChild(top);

    const bottom = document.createElement("div");
    bottom.className =
      "w-full mt-1 px-2 text-left text-[14px] text-white/[0.92] leading-[1.25] max-h-[calc(1.25em*2)] overflow-hidden";
    bottom.textContent = msg;
    toast.appendChild(bottom);

    toast.addEventListener("click", () => {
      toast.classList.add("toast--hide");
      window.setTimeout(() => toast.remove(), 340);
    });

    container.appendChild(toast);

    // animate-in
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
      toast.style.transition = "transform 380ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 380ms cubic-bezier(0.2, 0.9, 0.2, 1)";
    });

    const ttl = typeof opts?.ttlMs === "number" ? opts.ttlMs : 4200;
    const outMs = 220;
    window.setTimeout(() => toast.classList.add("toast--hide"), Math.max(0, ttl - outMs));
    window.setTimeout(() => toast.remove(), ttl);
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
