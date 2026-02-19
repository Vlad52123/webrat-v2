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
const SECTION_STORAGE_KEY = "webrat_detail_section";

function readSelectedVictimId(): string | null {
    try {
        if (typeof window === "undefined") return null;
        const fromStorage = sessionStorage.getItem(STORAGE_KEY);
        return fromStorage ? String(fromStorage) : null;
    } catch {
        return null;
    }
}

function readSelectedSection(): DetailSectionKey {
    try {
        if (typeof window === "undefined") return "information";
        const fromStorage = sessionStorage.getItem(SECTION_STORAGE_KEY);
        if (fromStorage) {
            const validSections: DetailSectionKey[] = ["information", "remote-start", "remote-desktop", "terminal", "stealer", "rofl"];
            if (validSections.includes(fromStorage as DetailSectionKey)) {
                return fromStorage as DetailSectionKey;
            }
        }
        return "information";
    } catch {
        return "information";
    }
}

function writeSelectedSection(section: DetailSectionKey) {
    try {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(SECTION_STORAGE_KEY, section);
    } catch {
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
    section: readSelectedSection(),
    selectedVictimId: readSelectedVictimId(),
    victimSnapshots: {},

    setSection: (next: DetailSectionKey) => {
        set({ section: next });
        writeSelectedSection(next);
    },

    selectVictim: (victimId: string) => {
        const id = String(victimId || "").trim();
        if (!id) return;
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
