import { useEffect, useRef, useState } from "react";

export function useWsMenuPosition() {
   const wsWrapRef = useRef<HTMLDivElement | null>(null);
   const wsBtnRef = useRef<HTMLButtonElement | null>(null);
   const wsMenuRef = useRef<HTMLDivElement | null>(null);
   const [wsOpen, setWsOpen] = useState(false);
   const [wsMenuPos, setWsMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

   useEffect(() => {
      if (!wsOpen) return;

      const calcPos = () => {
         const btn = wsBtnRef.current;
         if (!btn) return;
         const r = btn.getBoundingClientRect();
         setWsMenuPos({ left: r.left, top: r.bottom + 8, width: Math.max(220, r.width) });
      };

      calcPos();

      const onDocDown = (e: MouseEvent) => {
         const wrap = wsWrapRef.current;
         const menu = wsMenuRef.current;
         if (!wrap) return;
         const t = e.target as Node | null;
         if (!t) return;
         if (wrap.contains(t)) return;
         if (menu && menu.contains(t)) return;
         setWsOpen(false);
      };

      const onKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") setWsOpen(false);
      };

      window.addEventListener("resize", calcPos);
      window.addEventListener("scroll", calcPos, true);
      document.addEventListener("mousedown", onDocDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
         window.removeEventListener("resize", calcPos);
         window.removeEventListener("scroll", calcPos, true);
         document.removeEventListener("mousedown", onDocDown);
         document.removeEventListener("keydown", onKeyDown);
      };
   }, [wsOpen]);

   return {
      wsWrapRef,
      wsBtnRef,
      wsMenuRef,
      wsOpen,
      setWsOpen,
      wsMenuPos,
   };
}