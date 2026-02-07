import { useEffect } from "react";

export function useHealthPing(): void {
   useEffect(() => {
      let cancelled = false;
      (async () => {
         try {
            await fetch("/api/health", { method: "GET", credentials: "include" });
         } catch {
            return;
         }
         if (cancelled) return;
      })();
      return () => {
         cancelled = true;
      };
   }, []);
}