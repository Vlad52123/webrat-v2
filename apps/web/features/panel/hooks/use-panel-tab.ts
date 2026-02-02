"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type PanelTabKey = "panel" | "builder" | "community" | "settings";

function parseHash(hash: string): PanelTabKey | null {
  const raw = hash.replace(/^#/, "").trim();
  if (raw === "panel" || raw === "builder" || raw === "community" || raw === "settings") {
    return raw;
  }
  return null;
}

export function usePanelTab() {
  const [tab, setTabState] = useState<PanelTabKey>("panel");

  useEffect(() => {
    const current = parseHash(window.location.hash);
    if (current) {
      setTabState(current);
      return;
    }

    window.location.hash = "#panel";
    setTabState("panel");
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      setTabState(next ?? "panel");
    };

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const setTab = useCallback((next: PanelTabKey) => {
    if (typeof window === "undefined") return;
    window.location.hash = `#${next}`;
  }, []);

  return useMemo(
    () => ({
      tab,
      setTab,
    }),
    [setTab, tab],
  );
}
