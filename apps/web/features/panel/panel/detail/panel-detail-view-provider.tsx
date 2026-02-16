"use client";

import { useEffect, useMemo, type ReactNode } from "react";

import type { Victim } from "../../api/victims";
import type { DetailSectionKey } from "../state/detail-section";
import { usePanelDetailViewStore } from "./panel-detail-view-store";

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

export function PanelDetailViewProvider(props: { children: ReactNode }) {
    const { children } = props;

    const isOpen = usePanelDetailViewStore((s) => s.isOpen);

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

    return children;
}

export function usePanelDetailView() {
    const isOpen = usePanelDetailViewStore((s) => s.isOpen);
    const section = usePanelDetailViewStore((s) => s.section);
    const selectedVictimId = usePanelDetailViewStore((s) => s.selectedVictimId);
    const victimSnapshots = usePanelDetailViewStore((s) => s.victimSnapshots);
    const setSection = usePanelDetailViewStore((s) => s.setSection);
    const selectVictim = usePanelDetailViewStore((s) => s.selectVictim);
    const openDetailForVictim = usePanelDetailViewStore((s) => s.openDetailForVictim);
    const closeDetailView = usePanelDetailViewStore((s) => s.closeDetailView);
    const rememberVictimSnapshot = usePanelDetailViewStore((s) => s.rememberVictimSnapshot);

    return useMemo<PanelDetailViewContextValue>(
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
        [
            closeDetailView,
            isOpen,
            openDetailForVictim,
            rememberVictimSnapshot,
            section,
            selectVictim,
            selectedVictimId,
            setSection,
            victimSnapshots,
        ],
    );
}
