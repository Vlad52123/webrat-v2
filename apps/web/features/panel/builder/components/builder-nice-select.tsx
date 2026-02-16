import type { ReactNode } from "react";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type Opt = { value: string; label: ReactNode };

export function BuilderNiceSelect(props: {
    id: string;
    options: Opt[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    buttonClassName?: string;
    menuClassName?: string;
}) {
    const { id, options, value, defaultValue, onValueChange, buttonClassName, menuClassName } = props;

    const initial = useMemo(() => {
        if (typeof value === "string") return value;
        if (typeof defaultValue === "string") return defaultValue;
        return options[0]?.value ?? "";
    }, [defaultValue, options, value]);

    const [innerValue, setInnerValue] = useState<string>(() => initial);
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const effectiveValue = typeof value === "string" ? value : innerValue;

    useEffect(() => {
        if (typeof value === "string") return;
        const t = window.setTimeout(() => {
            setInnerValue(initial);
        }, 0);
        return () => window.clearTimeout(t);
    }, [initial, value]);

    const selectedLabel = useMemo(() => {
        const hit = options.find((o) => o.value === effectiveValue);
        return hit ? hit.label : options[0]?.label ?? "";
    }, [effectiveValue, options]);

    const syncPos = () => {
        const btn = btnRef.current;
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        setMenuPos({ left: r.left, top: r.bottom + 6, width: r.width });
    };

    useEffect(() => {
        if (!open) return;

        syncPos();

        const onPointerDown = (e: MouseEvent) => {
            const t = e.target as Node | null;
            if (!t) return;
            if (wrapRef.current && wrapRef.current.contains(t)) return;
            if (menuRef.current && menuRef.current.contains(t)) return;
            setOpen(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        const onScrollOrResize = () => {
            setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [open]);

    const selectValue = (next: string) => {
        if (typeof value !== "string") setInnerValue(next);
        onValueChange?.(next);
        setOpen(false);
    };

    return (
        <div ref={wrapRef} className="relative w-full">
            <select
                id={id}
                className="absolute inset-0 opacity-0 pointer-events-none"
                aria-hidden
                tabIndex={-1}
                value={effectiveValue}
                onChange={(e) => {
                    const next = e.target.value;
                    if (typeof value !== "string") setInnerValue(next);
                    onValueChange?.(next);
                }}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {String(o.label)}
                    </option>
                ))}
            </select>

            <button
                ref={btnRef}
                type="button"
                className={
                    buttonClassName ??
                    "w-full h-[34px] px-[12px] pr-[32px] rounded-[10px] border border-white/[0.10] bg-white/[0.04] text-[13px] font-medium text-white/[0.92] cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-[border-color,background,box-shadow] duration-[160ms] " +
                    (open ? "border-white/[0.22] bg-white/[0.06] shadow-[0_0_0_3px_rgba(186,85,211,0.08)]" : "hover:bg-white/[0.06] hover:border-white/[0.18]")
                }
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selectedLabel}
                <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
                    <img
                        src="/icons/arrow.svg"
                        alt="v"
                        draggable={false}
                        className={"h-[10px] w-[10px] invert opacity-60 transition-transform duration-[160ms] " + (open ? "rotate-180" : "")}
                    />
                </span>
            </button>

            {open && menuPos
                ? createPortal(
                    <div
                        ref={menuRef}
                        className={
                            menuClassName ??
                            "fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
                        }
                        style={{ left: menuPos.left, top: menuPos.top, width: menuPos.width }}
                        role="listbox"
                    >
                        {options.map((opt) => {
                            const selected = effectiveValue === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "w-full text-left px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold text-white/90 transition-[background,border-color] cursor-pointer border " +
                                        (selected
                                            ? "bg-white/[0.07] border-white/[0.16] text-white"
                                            : "bg-transparent border-transparent hover:bg-white/[0.045] hover:border-white/[0.10]")
                                    }
                                    onClick={() => selectValue(opt.value)}
                                    role="option"
                                    aria-selected={selected}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>,
                    document.body,
                )
                : null}
        </div>
    );
}
