import { useCallback, useRef } from "react";

import { clamp } from "./utils";

export function useSliderDrag(p: {
    locked: boolean;
    verified: boolean;
    thumbRef: React.RefObject<HTMLDivElement | null>;
    sliderRef: React.RefObject<HTMLDivElement | null>;
    trackRef: React.RefObject<HTMLDivElement | null>;
    updateMoverFromThumb: () => void;
}) {
    const { locked, verified, thumbRef, sliderRef, trackRef, updateMoverFromThumb } = p;

    const draggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const thumbStartLeftRef = useRef(0);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (verified || locked) return;
            const thumb = thumbRef.current;
            if (!thumb) return;

            draggingRef.current = true;
            thumb.setPointerCapture(e.pointerId);

            dragStartXRef.current = e.clientX;
            thumbStartLeftRef.current = parseFloat(thumb.style.left || "0");
        },
        [locked, thumbRef, verified],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!draggingRef.current || verified || locked) return;

            const slider = sliderRef.current;
            const thumb = thumbRef.current;
            const track = trackRef.current;
            if (!slider || !thumb || !track) return;

            const sliderRect = slider.getBoundingClientRect();
            const thumbRect = thumb.getBoundingClientRect();
            const maxLeft = sliderRect.width - thumbRect.width;

            const dx = e.clientX - dragStartXRef.current;
            const left = clamp(thumbStartLeftRef.current + dx, 0, maxLeft);

            thumb.style.left = `${left}px`;
            track.style.width = `${left + thumbRect.width}px`;

            const percent = maxLeft > 0 ? Math.round((left / maxLeft) * 100) : 0;
            thumb.setAttribute("aria-valuenow", String(percent));

            updateMoverFromThumb();
        },
        [locked, sliderRef, thumbRef, trackRef, updateMoverFromThumb, verified],
    );

    const endDrag = useCallback((): boolean => {
        if (!draggingRef.current || verified || locked) return false;
        draggingRef.current = false;
        return true;
    }, [locked, verified]);

    return {
        draggingRef,
        onPointerDown,
        onPointerMove,
        endDrag,
    };
}
