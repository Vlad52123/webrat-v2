"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { csrfHeaders } from "../builder/utils/csrf";
import { showToast } from "../toast";

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
    const res = await fetch("/api/subscription", { method: "GET", credentials: "include" });
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
      const res = await fetch("/api/activate-key", {
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
      <div className="shopPage flex h-full w-full flex-col items-start justify-start pt-[16px] pl-[32px] pr-[18px]">
        <div className="shopGrid mt-[12px] grid gap-[26px] [grid-template-columns:auto_auto]">
          <div className="shopCard shopCardKey grid min-h-[200px] min-w-[360px] justify-items-stretch rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] p-[18px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
            <div className="shopCardTitle mb-[4px] text-[17px] font-bold text-white">Key activation.</div>
            <div className="shopInputRow w-full" style={{ margin: "16px 0 14px" }}>
              <input
                id="shopKeyInput"
                className="shopInput w-full rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] py-[10px] text-center text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.7)] focus:border-white/[0.28]"
                type="text"
                placeholder="key"
                autoComplete="off"
                name="shop-key-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onFocus={() => {
                  if (clearedOnFocusRef.current) return;
                  const v = String(key || "").trim();
                  if (!v) return;
                  if (!v.includes(" ") && v.length <= 128) {
                    setKey("");
                  }
                  clearedOnFocusRef.current = true;
                }}
              />
            </div>
            <div className="flex w-full justify-center">
              <button
                id="shopActivateBtn"
                className="shopActivateBtn mt-[6px] min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                disabled={isLoading}
                onClick={() => activate().catch(() => { })}
              >
                Activate
              </button>
            </div>
          </div>

          <div className="shopCard shopCardStatus grid min-h-[200px] min-w-[240px] place-items-center rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] p-[18px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
            <div className="shopCardTitle mb-[4px] text-[17px] font-bold text-white">Subscription status.</div>
            <div
              id="shopStatusTitle"
              className="shopStatusTitle mb-[10px] text-center text-[18px] font-extrabold text-white [text-shadow:0_1px_0_rgba(0,0,0,0.65),0_0_6px_rgba(0,0,0,0.55)]"
            >
              {statusTitle}
            </div>
            <div className="shopStatusText mb-[8px] text-center text-[15px] font-semibold text-[rgba(200,200,200,0.9)]">
              Subscription until
            </div>
            <div id="shopStatusUntil" className="shopStatusUntil mt-[6px] text-center text-[16px] font-bold text-[rgba(220,220,220,0.96)]">
              {until}
            </div>
          </div>
        </div>

        <div className="shopSectionTitle relative mt-[30px] mb-[14px] w-full text-left text-[22px] font-extrabold tracking-[0.03em] text-white/[0.98] [text-shadow:0_1px_0_rgba(0,0,0,0.65),0_0_14px_rgba(0,0,0,0.65)]">
          Shop
          <span className="pointer-events-none absolute left-[-32px] bottom-[-8px] h-[2px] w-[calc(100%+64px)] opacity-95 [filter:drop-shadow(0_0_10px_rgba(0,0,0,0.85))]" style={{ background: "var(--line)" }} />
        </div>

        <div className="shopProductsGrid grid w-full gap-[16px] justify-center justify-items-center [grid-template-columns:repeat(3,240px)] max-[1200px]:[grid-template-columns:repeat(2,230px)] max-[880px]:[grid-template-columns:230px]">
          {[
            { period: "for a month", subtitle: "Buy WebCrystal for a month", price: "$3,78" },
            { period: "for a year", subtitle: "Buy WebCrystal for a year", price: "$7,58" },
            { period: "forever", subtitle: "Buy WebCrystal forever", price: "$16,43" },
          ].map((p) => (
            <div
              key={p.period}
              className="shopProductCard flex w-full min-h-[150px] flex-col items-center justify-center rounded-[16px] border border-white/[0.14] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),rgba(15,15,15,0.84))] px-[14px] py-[10px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.75),0_0_0_3px_rgba(255,255,255,0.08)] backdrop-blur-[10px] transition-[transform,box-shadow,border-color,background] duration-150 hover:translate-y-[-2px] hover:scale-[1.01] hover:border-white/[0.26] hover:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),rgba(15,15,15,0.90))] hover:shadow-[0_22px_52px_rgba(0,0,0,0.82),0_0_0_4px_rgba(255,255,255,0.12)]"
            >
              <div className="shopProductVip mb-[6px] text-[14px] font-black text-[#ff3b3b]">RATER</div>
              <div className="shopProductPeriod mb-[4px] text-[13px] font-extrabold text-white">{p.period}</div>
              <div className="shopProductSubtitle mb-[8px] text-[12px] text-[rgba(230,230,230,0.9)]">{p.subtitle}</div>
              <div className="shopProductPriceValue text-[16px] font-extrabold text-[#4ee97a]">{p.price}</div>
            </div>
          ))}
        </div>

        <div className="shopResellerSection w-full ml-[-32px] overflow-x-hidden">
          <div className="shopResellerSeparator my-[26px] mb-[12px] h-[3px] w-full shadow-[0_0_10px_rgba(0,0,0,0.75)]" style={{ background: "var(--line)" }} />
          <div className="shopResellerWarning mb-[6px] text-center text-[15px] font-extrabold uppercase text-[#ff4a4a]">
            DON&apos;T BUY FROM USERS OUTSIDE OF THE OFFICIAL RESELLER LIST, YOU WILL BE SCAMMED.
          </div>
          <div className="shopResellerHeader mb-[16px] text-center text-[17px] font-bold text-white">Official Reseller Contacts</div>

          <div className="shopResellerGrid flex flex-wrap justify-center gap-[40px] pb-[24px]">
            <div className="shopResellerCard min-w-[360px] max-w-[420px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] px-[16px] py-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
              <div className="shopResellerTitle mb-[4px] text-center text-[16px] font-bold text-white">WebCrystalbot</div>
              <div className="shopResellerLine mx-[-4px] my-[10px] h-[2px] shadow-[0_0_10px_rgba(0,0,0,0.75)]" style={{ background: "var(--line)" }} />
              <div className="shopResellerRow mb-[8px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.10] bg-[rgba(0,0,0,0.28)] px-[10px] py-[8px] text-[13px]">
                <span className="shopResellerLabel font-semibold text-white">Contacts:</span>
                <span className="shopResellerValue text-[rgba(220,220,220,0.96)]">Telegram: @WebCrystalbot</span>
              </div>
              <div className="shopResellerRow mb-[8px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.10] bg-[rgba(0,0,0,0.28)] px-[10px] py-[8px] text-[13px]">
                <span className="shopResellerLabel font-semibold text-white">Payment:</span>
                <span className="shopResellerValue text-[rgba(220,220,220,0.96)]">Crypto</span>
              </div>
              <button
                className="shopResellerBtn mt-[10px] w-full cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] px-[12px] py-[10px] text-[13px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={() => {
                  try {
                    window.open("https://t.me/webcrystalbot", "_blank", "noopener,noreferrer");
                  } catch {
                  }
                }}
              >
                Open telegram
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
