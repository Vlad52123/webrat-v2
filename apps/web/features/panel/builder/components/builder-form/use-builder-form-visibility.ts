import { useEffect } from "react";

type Params = {
   open: boolean;
   hidden: boolean;
   setHidden: (v: boolean) => void;
   setIsOpenClass: (v: boolean) => void;
   el: HTMLDivElement | null;
};

export function useBuilderFormVisibility(p: Params): void {
   const { open, hidden, setHidden, setIsOpenClass, el } = p;

   useEffect(() => {
      if (!el) return;

      if (open) {
         if (hidden) {
            window.setTimeout(() => {
               setHidden(false);
            }, 0);
         }
         requestAnimationFrame(() => {
            setIsOpenClass(true);
         });
         return;
      }

      window.setTimeout(() => {
         setIsOpenClass(false);
      }, 0);
      const onEnd = (e: TransitionEvent) => {
         if (e.target !== el) return;
         setHidden(true);
      };
      el.addEventListener("transitionend", onEnd, { once: true });
      return () => {
         try {
            el.removeEventListener("transitionend", onEnd);
         } catch {
         }
      };
   }, [open, hidden, setHidden, setIsOpenClass, el]);
}