import { useEffect } from "react";

export function useLowPerfClass(): void {
    useEffect(() => {
        try {
            const apply = (low: boolean) => {
                try {
                    document.documentElement.classList.toggle("lowPerf", low);
                } catch {
                }
            };

            let forced: boolean | null = null;
            try {
                const v = localStorage.getItem("webrat_low_perf");
                if (v === "1" || v === "true" || v === "on") forced = true;
                if (v === "0" || v === "false" || v === "off") forced = false;
            } catch {
            }

            let low = false;
            try {
                const hc = (navigator as unknown as { hardwareConcurrency?: unknown }).hardwareConcurrency;
                if (typeof hc === "number" && Number.isFinite(hc) && hc > 0 && hc <= 4) low = true;
            } catch {
            }
            try {
                const dm = (navigator as unknown as { deviceMemory?: unknown }).deviceMemory;
                if (typeof dm === "number" && Number.isFinite(dm) && dm > 0 && dm <= 4) low = true;
            } catch {
            }
            try {
                if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
                    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) low = true;
                    const m = window.matchMedia("(prefers-reduced-transparency: reduce)");
                    if (m && "matches" in m && m.matches) low = true;
                }
            } catch {
            }

            if (forced != null) {
                apply(forced);
                return;
            }

            apply(low);

            let raf = 0;
            let frames = 0;
            let start = 0;
            const tick = (ts: number) => {
                frames += 1;
                if (!start) start = ts;
                const elapsed = ts - start;
                if (elapsed < 1200) {
                    raf = window.requestAnimationFrame(tick);
                    return;
                }

                const fps = frames / (elapsed / 1000);
                if (Number.isFinite(fps) && fps > 0 && fps < 50) {
                    apply(true);
                }
            };
            raf = window.requestAnimationFrame(tick);
            return () => {
                try {
                    if (raf) window.cancelAnimationFrame(raf);
                } catch {
                }
            };
        } catch {
        }
    }, []);
}
