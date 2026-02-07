export function clampDelay(v: number): number {
   if (!Number.isFinite(v)) return 1;
   return Math.max(1, Math.min(10, v));
}