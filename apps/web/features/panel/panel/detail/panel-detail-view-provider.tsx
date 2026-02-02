"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { DetailSectionKey } from "../state/detail-section";

type PanelDetailViewContextValue = {
  isOpen: boolean;
  section: DetailSectionKey;
  selectedVictimId: string | null;
  setSection: (next: DetailSectionKey) => void;
  selectVictim: (victimId: string) => void;
  openDetailForVictim: (victimId: string) => void;
  closeDetailView: () => void;
};

const PanelDetailViewContext = createContext<PanelDetailViewContextValue | null>(null);

const STORAGE_KEY = "webrat_selected_victim";

export function PanelDetailViewProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<DetailSectionKey>("information");

  useEffect(() => {
    try {
      const fromStorage = sessionStorage.getItem(STORAGE_KEY);
      if (fromStorage) setSelectedVictimId(fromStorage);
    } catch {
    }
  }, []);

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

  const value = useMemo<PanelDetailViewContextValue>(
    () => ({
      isOpen,
      section,
      selectedVictimId,
      setSection,
      selectVictim,
      openDetailForVictim,
      closeDetailView,
    }),
    [isOpen, section, selectedVictimId, selectVictim, openDetailForVictim, closeDetailView],
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
