import { useEffect, useRef, useState } from "react";

export function useDropdownPosition() {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

    useEffect(() => {
        if (!open) return;

        const calcPos = () => {
            const btn = btnRef.current;
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            setMenuPos({ left: r.left, top: r.bottom + 8, width: Math.max(180, r.width) });
        };

        calcPos();

        const onDocDown = (e: MouseEvent) => {
            const wrap = wrapRef.current;
            const menu = menuRef.current;
            if (!wrap) return;
            const t = e.target as Node | null;
            if (!t) return;
            if (wrap.contains(t)) return;
            if (menu && menu.contains(t)) return;
            setOpen(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
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
    }, [open]);

    return {
        wrapRef,
        btnRef,
        menuRef,
        open,
        setOpen,
        menuPos,
    };
}
