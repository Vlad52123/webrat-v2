"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { csrfHeaders } from "../builder/utils/csrf";
import { useSubscriptionQuery } from "../hooks/use-subscription-query";
import { showToast } from "../toast";
import { ShopSubscriptionGrid } from "../shop/components/shop-subscription-grid";
import { ShopSectionTitle } from "../shop/components/shop-section-title";
import { ShopProductsGrid } from "../shop/components/shop-products-grid";
import { ShopResellerSection } from "../shop/components/shop-reseller-section";
import { shopClasses } from "../shop/styles";

export function ShopScreen() {
    const qc = useQueryClient();
    const subQ = useSubscriptionQuery();
    const [key, setKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const clearedOnFocusRef = useRef(false);

    const formatSubscriptionDate = useCallback((iso: unknown): string => {
        if (!iso) return "-";
        const d = new Date(String(iso));
        if (!Number.isFinite(d.getTime())) return "-";
        try {
            return d.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "-";
        }
    }, []);

    const statusTitle = useMemo(() => {
        if (subQ.isLoading) return "...";
        const status = String(subQ.data?.status || "none").toLowerCase();
        return status === "vip" ? "RATER" : "NONE";
    }, [subQ.data?.status, subQ.isLoading]);

    const kind = useMemo(() => {
        const k = String(subQ.data?.kind || "month").toLowerCase();
        return k || "month";
    }, [subQ.data?.kind]);

    const until = useMemo(() => {
        if (subQ.isLoading) return "...";
        const status = String(subQ.data?.status || "none").toLowerCase();
        const isVip = status === "vip";
        if (!isVip) return "-";
        if (kind === "forever") return "Forever";
        return formatSubscriptionDate(subQ.data?.activated_at);
    }, [formatSubscriptionDate, kind, subQ.data?.activated_at, subQ.data?.status, subQ.isLoading]);

    const activate = useCallback(async () => {
        const k = String(key || "").trim();
        if (!k) return;

        setKey("");

        if (String(statusTitle || "").toUpperCase() === "RATER" && String(kind || "").toLowerCase() === "forever") {
            showToast("error", "You already have a lifetime subscription!");
            setKey("");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/activate-key/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...csrfHeaders(),
                },
                body: JSON.stringify({ key: k }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    try {
                        window.location.href = "/login/";
                    } catch {
                    }
                    return;
                }
                if (res.status === 403) {
                    showToast("error", "Request blocked");
                    return;
                }
                if (res.status === 404) {
                    showToast("error", "API error: /api/activate-key not found");
                    return;
                }
                if (res.status === 429) {
                    showToast("error", "Too many requests, try later");
                    return;
                }
                if (res.status === 409) {
                    showToast("error", "Key has already been activated");
                    return;
                }
                if (res.status === 423) {
                    showToast("error", "You cannot activate this key, you already have a lifetime subscription!");
                    return;
                }
                if (res.status === 400) {
                    showToast("error", "Wrong key");
                    return;
                }
                showToast("error", "Wrong key");
                return;
            }

            try {
                await qc.invalidateQueries({ queryKey: ["subscription"] });
            } catch {
            }

            showToast("success", "Key activated");

            try {
                window.setTimeout(() => {
                    try {
                        window.location.replace("/panel/#panel");
                    } catch {
                    }
                }, 450);
            } catch {
            }

            try {
                await qc.invalidateQueries({ queryKey: ["subscription"] });
            } catch {
            }
            try {
                await qc.invalidateQueries({ queryKey: ["victims"] });
            } catch {
            }
        } catch {
            showToast("error", "Request failed");
        } finally {
            setIsLoading(false);
        }
    }, [key, kind, qc, statusTitle]);

    return (
        <div id="shopView" className="h-full overflow-x-hidden overflow-y-auto">
            <div className={shopClasses.page}>
                <div className="mb-[20px] w-full text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.55)]" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>Shop</div>
                </div>
                <ShopSubscriptionGrid
                    keyValue={key}
                    onKeyChange={setKey}
                    onKeyFocus={() => {
                        if (clearedOnFocusRef.current) return;
                        const v = String(key || "").trim();
                        if (!v) return;
                        if (!v.includes(" ") && v.length <= 128) {
                            setKey("");
                        }
                        clearedOnFocusRef.current = true;
                    }}
                    onActivate={() => activate().catch(() => { })}
                    isLoading={isLoading}
                    isVip={String(statusTitle || "").toUpperCase() === "RATER"}
                    statusTitle={statusTitle}
                    until={until}
                />

                <ShopSectionTitle>Shop</ShopSectionTitle>
                <ShopProductsGrid />
                <ShopResellerSection />
            </div>
        </div>
    );
}
