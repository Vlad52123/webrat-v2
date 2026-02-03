"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { csrfHeaders } from "../builder/utils/csrf";
import { showToast } from "../toast";
import { ShopSubscriptionGrid } from "../shop/components/shop-subscription-grid";
import { ShopSectionTitle } from "../shop/components/shop-section-title";
import { ShopProductsGrid } from "../shop/components/shop-products-grid";
import { ShopResellerSection } from "../shop/components/shop-reseller-section";

export function ShopScreen() {
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const [statusTitle, setStatusTitle] = useState("NONE");
  const [until, setUntil] = useState("-");
  const [isLoading, setIsLoading] = useState(false);
  const [kind, setKind] = useState("month");
  const clearedOnFocusRef = useRef(false);
  const didToastLoadRef = useRef(false);

  const loadSubscription = useCallback(async () => {
    const res = await fetch("/api/subscription/", { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = (await res.json().catch(() => null)) as unknown;
    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const status = String(obj?.status || "none").toUpperCase();
    setStatusTitle(status);

    const k = String(obj?.kind || "month").toLowerCase();
    setKind(k || "month");

    try {
      const activatedAtRaw = obj?.activated_at;
      const activatedAt = activatedAtRaw ? new Date(String(activatedAtRaw)) : null;
      if (activatedAt && Number.isFinite(activatedAt.getTime())) {
        setUntil(activatedAt.toISOString().slice(0, 10));
      } else {
        setUntil("-");
      }
    } catch {
      setUntil("-");
    }
  }, []);

  useEffect(() => {
    loadSubscription().catch(() => {
      setStatusTitle("NONE");
      setUntil("-");
      if (didToastLoadRef.current) return;
      didToastLoadRef.current = true;
      showToast("error", "Failed to load subscription status");
    });
  }, [loadSubscription]);

  const activate = useCallback(async () => {
    const k = String(key || "").trim();
    if (!k) return;

    setKey("");

    if (String(statusTitle || "").toUpperCase() === "VIP" && String(kind || "").toLowerCase() === "forever") {
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
            window.location.replace("/login");
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

      await loadSubscription();

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
  }, [key, kind, loadSubscription, qc, statusTitle]);

  return (
    <div id="shopView" className="h-full overflow-x-hidden overflow-y-auto">
      <div className="flex h-full w-full flex-col items-start justify-start pt-[16px] pl-[32px] pr-[18px]">
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