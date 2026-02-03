export type WsConnState = "idle" | "connecting" | "open" | "closed";

export type WsJson = Record<string, unknown>;

export function getWsUrl(hostOverride: string): string {
  const proto = typeof window !== "undefined" && window.location && window.location.protocol === "https:" ? "wss" : "ws";

  const host = String(hostOverride || "").trim() || (typeof window !== "undefined" ? window.location.host : "");

  return `${proto}://${host}/ws`;
}

export function safeJsonParse(raw: string): WsJson | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (v && typeof v === "object") return v as WsJson;
  } catch {
  }
  return null;
}

export function dispatchWsMessage(msg: WsJson) {
  try {
    window.dispatchEvent(new CustomEvent("webrat_ws_message", { detail: msg }));
  } catch {
  }
}

declare global {
  interface WindowEventMap {
    webrat_ws_message: CustomEvent<WsJson>;
  }
}
