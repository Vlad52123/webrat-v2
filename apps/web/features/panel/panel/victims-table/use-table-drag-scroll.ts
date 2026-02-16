import { useEffect, useRef } from "react";

export function useTableDragScroll(tableContainerRef: React.RefObject<HTMLDivElement | null>) {
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
    }, [tableContainerRef]);
}
