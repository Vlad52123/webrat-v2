"use client";

import { useEffect, useRef } from "react";

import type { VictimsColumnKey } from "./victims-columns";

const fixedKeys = new Set<VictimsColumnKey>([]);

function getColKey(cell: Element | null): VictimsColumnKey | null {
   if (!cell) return null;
   const classes = Array.from(cell.classList);
   const key = classes.find((c) => c && c.startsWith("h-")) as VictimsColumnKey | undefined;
   return key ?? null;
}

export function useVictimsTableColumnReorder(args: {
   headerRow: HTMLTableRowElement | null;
   columnOrder: VictimsColumnKey[];
   setColumnOrder: (next: VictimsColumnKey[]) => void;
}) {
   const { headerRow, columnOrder, setColumnOrder } = args;

   const latestOrderRef = useRef<VictimsColumnKey[]>(columnOrder);

   useEffect(() => {
      latestOrderRef.current = columnOrder;
   }, [columnOrder]);

   const dragRef = useRef<{
      dragging: boolean;
      dragTh: HTMLTableCellElement | null;
      pointerId: number | null;
      ghost: HTMLElement | null;
      ghostOffsetX: number;
      ghostOffsetY: number;
      ghostTop: number;
      ghostWidth: number;
   }>({
      dragging: false,
      dragTh: null,
      pointerId: null,
      ghost: null,
      ghostOffsetX: 0,
      ghostOffsetY: 0,
      ghostTop: 0,
      ghostWidth: 0,
   });

   useEffect(() => {
      if (!headerRow) return;

      const getHeaderCells = () => Array.from(headerRow.children).filter((n): n is HTMLTableCellElement => n instanceof HTMLTableCellElement);

      const markReorderable = () => {
         const cells = getHeaderCells();
         cells.forEach((th) => {
            const key = getColKey(th);
            const can = !!key && !fixedKeys.has(key);
            try {
               th.classList.toggle("isReorderable", can);
            } catch {
            }
         });
      };

      markReorderable();

      const clear = () => {
         const st = dragRef.current;
         if (st.dragTh) {
            try {
               st.dragTh.classList.remove("isDragging");
            } catch {
            }
         }
         if (st.ghost && st.ghost.parentNode) {
            try {
               st.ghost.parentNode.removeChild(st.ghost);
            } catch {
            }
         }
         dragRef.current.dragging = false;
         dragRef.current.dragTh = null;
         dragRef.current.pointerId = null;
         dragRef.current.ghost = null;
         dragRef.current.ghostOffsetX = 0;
         dragRef.current.ghostOffsetY = 0;
         dragRef.current.ghostTop = 0;
         dragRef.current.ghostWidth = 0;
      };

      const onPointerDown = (e: PointerEvent) => {
         if (!e || e.button !== 0) return;
         const target = e.target as Element | null;
         const th = target && (target.closest?.("th") as HTMLTableCellElement | null);
         if (!th) return;
         const key = getColKey(th);
         if (!key || fixedKeys.has(key)) return;

         dragRef.current.dragging = true;
         dragRef.current.dragTh = th;
         dragRef.current.pointerId = e.pointerId;

         try {
            const rect = th.getBoundingClientRect();
            dragRef.current.ghostOffsetX = e.clientX - rect.left;
            dragRef.current.ghostOffsetY = e.clientY - rect.top;
            dragRef.current.ghostTop = rect.top;
            dragRef.current.ghostWidth = rect.width;

            const ghost = th.cloneNode(true) as HTMLElement;
            ghost.classList.add("colDragGhost");
            ghost.style.width = rect.width + "px";
            ghost.style.height = rect.height + "px";
            ghost.style.left = rect.left + "px";
            ghost.style.top = rect.top + "px";
            document.body.appendChild(ghost);
            dragRef.current.ghost = ghost;
         } catch {
         }

         try {
            headerRow.setPointerCapture(e.pointerId);
         } catch {
         }
         try {
            th.classList.add("isDragging");
         } catch {
         }
         try {
            e.preventDefault();
         } catch {
         }
      };

      const onPointerMove = (e: PointerEvent) => {
         const st = dragRef.current;
         if (!st.dragging || !st.dragTh) return;
         if (st.pointerId != null && e.pointerId !== st.pointerId) return;

         if (st.ghost) {
            try {
               const x = e.clientX - st.ghostOffsetX;
               const maxX = Math.max(0, (window.innerWidth || 0) - (st.ghostWidth || 0));
               const clampedX = Math.max(0, Math.min(maxX, x));
               st.ghost.style.left = clampedX + "px";
               st.ghost.style.top = st.ghostTop + "px";
            } catch {
            }
         }

         let el: Element | null = null;
         try {
            el = document.elementFromPoint(e.clientX, e.clientY);
         } catch {
            el = null;
         }
         const overTh = el && (el.closest?.("th") as HTMLTableCellElement | null);
         if (!overTh) return;

         const overKey = getColKey(overTh);
         if (!overKey || fixedKeys.has(overKey)) return;

         const cells = getHeaderCells();
         const oldIndex = cells.indexOf(st.dragTh);
         const targetIndex = cells.indexOf(overTh);
         if (oldIndex === -1 || targetIndex === -1) return;
         if (oldIndex === targetIndex) return;

         const rect = overTh.getBoundingClientRect();
         const midpoint = rect.left + rect.width / 2;
         const before = e.clientX < midpoint;
         const dest = before ? targetIndex : targetIndex + 1;

         const fromKey = getColKey(st.dragTh);
         if (!fromKey) return;

         const cur = latestOrderRef.current.slice();
         const fromIdx = cur.indexOf(fromKey);
         if (fromIdx === -1) return;

         const without = cur.filter((k) => k !== fromKey);
         const clamped = Math.max(0, Math.min(without.length, dest));
         without.splice(clamped, 0, fromKey);
         setColumnOrder(without);
      };

      const onPointerUp = (e: PointerEvent) => {
         const st = dragRef.current;
         if (!st.dragging) return;
         if (st.pointerId != null && e.pointerId !== st.pointerId) return;
         clear();
      };

      const onPointerCancel = () => {
         if (!dragRef.current.dragging) return;
         clear();
      };

      headerRow.addEventListener("pointerdown", onPointerDown);
      headerRow.addEventListener("pointermove", onPointerMove);
      headerRow.addEventListener("pointerup", onPointerUp);
      headerRow.addEventListener("pointercancel", onPointerCancel);

      return () => {
         headerRow.removeEventListener("pointerdown", onPointerDown);
         headerRow.removeEventListener("pointermove", onPointerMove);
         headerRow.removeEventListener("pointerup", onPointerUp);
         headerRow.removeEventListener("pointercancel", onPointerCancel);
         clear();
      };
   }, [headerRow, setColumnOrder]);
}
