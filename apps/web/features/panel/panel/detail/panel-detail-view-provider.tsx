"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Victim } from "../../api/victims";
import type { DetailSectionKey } from "../state/detail-section";

type PanelDetailViewContextValue = {
  isOpen: boolean;
  section: DetailSectionKey;
  selectedVictimId: string | null;
  victimSnapshots: Record<string, Victim>;
  setSection: (next: DetailSectionKey) => void;
  selectVictim: (victimId: string) => void;
  openDetailForVictim: (victimId: string) => void;
  closeDetailView: () => void;
  rememberVictimSnapshot: (victim: Victim) => void;
};

const PanelDetailViewContext = createContext<PanelDetailViewContextValue | null>(null);

const STORAGE_KEY = "webrat_selected_victim";

export function PanelDetailViewProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(() => {
    try {
      const fromStorage = sessionStorage.getItem(STORAGE_KEY);
      return fromStorage ? String(fromStorage) : null;
    } catch {
      return null;
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<DetailSectionKey>("information");
  const [victimSnapshots, setVictimSnapshots] = useState<Record<string, Victim>>({});

  useEffect(() => {
    try {
      document.body.classList.toggle("isDetailView", isOpen);
    } catch {
    }

    return () => {
      try {
        document.body.classList.remove("isDetailView");
      } catch {
      }
    };
  }, [isOpen]);

  const selectVictim = useCallback((victimId: string) => {
    setSelectedVictimId(victimId);
    try {
      sessionStorage.setItem(STORAGE_KEY, victimId);
    } catch {
    }
  }, []);

  const openDetailForVictim = useCallback(
    (victimId: string) => {
      if (!victimId) return;
      selectVictim(victimId);
      setSection("information");
      setIsOpen(true);
    },
    [selectVictim],
  );

  const closeDetailView = useCallback(() => {
    setIsOpen(false);
    setSection("information");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }, []);

  const rememberVictimSnapshot = useCallback((victim: Victim) => {
    const id = String((victim as { id?: unknown }).id ?? "").trim();
    if (!id) return;
    setVictimSnapshots((prev) => {
      const next: Record<string, Victim> = { ...prev, [id]: victim };
      const keys = Object.keys(next);
      if (keys.length > 200) {
        delete next[keys[0]];
      }
      return next;
    });
  }, []);

  const value = useMemo<PanelDetailViewContextValue>(
    () => ({
      isOpen,
      section,
      selectedVictimId,
      victimSnapshots,
      setSection,
      selectVictim,
      openDetailForVictim,
      closeDetailView,
      rememberVictimSnapshot,
    }),
    [isOpen, section, selectedVictimId, victimSnapshots, selectVictim, openDetailForVictim, closeDetailView, rememberVictimSnapshot],
  );

  return <PanelDetailViewContext.Provider value={value}>{children}</PanelDetailViewContext.Provider>;
}

export function usePanelDetailView() {
  const ctx = useContext(PanelDetailViewContext);
  if (!ctx) {
    throw new Error("usePanelDetailView must be used within PanelDetailViewProvider");
  }
  return ctx;
}
