import { useCallback } from "react";

type Refs = {
   wrapRef: React.RefObject<HTMLDivElement | null>;
   sliderRef: React.RefObject<HTMLDivElement | null>;
   thumbRef: React.RefObject<HTMLDivElement | null>;
   trackRef: React.RefObject<HTMLDivElement | null>;
   imgRef: React.RefObject<HTMLImageElement | null>;
   targetRef: React.RefObject<HTMLDivElement | null>;
   moverRef: React.RefObject<HTMLDivElement | null>;
};

export function useCaptchaLayout(p: {
   refs: Refs;
   captchaCircleSize: number;
   startAngleRef: React.MutableRefObject<number>;
   currentAngleRef: React.MutableRefObject<number>;
}) {
   const { refs, captchaCircleSize, startAngleRef, currentAngleRef } = p;

   const placeTargets = useCallback(() => {
      const wrap = refs.wrapRef.current;
      const img = refs.imgRef.current;
      const target = refs.targetRef.current;
      const mover = refs.moverRef.current;
      if (!wrap || !img || !target || !mover) return;

      const width = wrap.clientWidth;
      const height = wrap.clientHeight;

      const targetX = width / 2 - captchaCircleSize / 2;
      const targetY = height / 2 - captchaCircleSize / 2;

      target.style.top = "50%";
      target.style.left = `${targetX}px`;
      target.style.transform = "translateY(-50%)";

      const src = img.currentSrc || img.src;
      mover.style.backgroundImage = src ? `url(\"${src}\")` : "";

      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const renderW = img.naturalWidth * scale;
      const renderH = img.naturalHeight * scale;

      const offsetX = (renderW - width) / 2;
      const offsetY = (renderH - height) / 2;

      mover.style.backgroundSize = `${renderW}px ${renderH}px`;
      mover.style.backgroundPosition = `-${targetX + offsetX}px -${targetY + offsetY}px`;

      mover.style.top = "50%";
      mover.style.left = `${targetX}px`;
      mover.style.transform = `translateY(-50%) rotate(${currentAngleRef.current}deg)`;
   }, [captchaCircleSize, currentAngleRef, refs.imgRef, refs.moverRef, refs.targetRef, refs.wrapRef]);

   const updateMoverFromThumb = useCallback(() => {
      const slider = refs.sliderRef.current;
      const thumb = refs.thumbRef.current;
      const mover = refs.moverRef.current;
      if (!slider || !thumb || !mover) return;

      const sliderRect = slider.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const maxLeft = sliderRect.width - thumbRect.width;
      const left = parseFloat(thumb.style.left || "0");
      const t = maxLeft > 0 ? left / maxLeft : 0;

      const angle = startAngleRef.current + t * 360;
      currentAngleRef.current = angle;

      mover.style.transform = `translateY(-50%) rotate(${angle}deg)`;
   }, [currentAngleRef, refs.moverRef, refs.sliderRef, refs.thumbRef, startAngleRef]);

   return { placeTargets, updateMoverFromThumb };
}