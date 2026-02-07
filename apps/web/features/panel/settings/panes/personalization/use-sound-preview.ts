import { useMemo, useRef } from "react";

export function useSoundPreview(): (vol: number) => void {
   const soundPreviewRef = useRef<HTMLAudioElement | null>(null);
   const lastSoundPreviewAtRef = useRef(0);

   return useMemo(() => {
      return (vol: number) => {
         const v = Math.max(0, Math.min(1, Number.isFinite(vol) ? vol : 0));
         if (v <= 0.01) return;
         const now = Date.now();
         if (now - lastSoundPreviewAtRef.current < 140) return;
         lastSoundPreviewAtRef.current = now;

         try {
            const a = soundPreviewRef.current || new Audio("/sounds/new-victim.mp3");
            soundPreviewRef.current = a;
            a.volume = v;
            a.currentTime = 0;
            void a.play();
         } catch {
         }
      };
   }, []);
}