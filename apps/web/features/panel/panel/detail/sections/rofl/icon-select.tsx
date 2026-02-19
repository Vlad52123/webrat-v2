"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";
import { createPortal } from "react-dom";

import { ICON_OPTIONS, type IconOptionValue } from "./icon-options";

interface Props {
    value: IconOptionValue;
    onChange: (value: IconOptionValue) => void;
    wrapRef: RefObject<HTMLDivElement | null>;
    btnRef: RefObject<HTMLButtonElement | null>;
    menuRef: RefObject<HTMLDivElement | null>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    menuPos: { left: number; top: number; width: number } | null;
}

export function IconSelect({ value, onChange, wrapRef, btnRef, menuRef, open, setOpen, menuPos }: Props) {
    return (
        <div ref={wrapRef}>
            <button
                ref={btnRef}
                type="button"
                className={
                    "flex h-[32px] items-center gap-[6px] rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-[10px] text-[13px] font-semibold text-white/80 transition-all cursor-pointer " +
                    "hover:bg-white/[0.07] hover:border-white/[0.18] hover:text-white"
                }
                onClick={() => setOpen(!open)}
            >
                {ICON_OPTIONS.find((o) => o.value === value)?.label || "Info"}
                <span className="text-[10px] opacity-50">▼</span>
            </button>

            {open && menuPos
                ? createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
                        style={{ left: menuPos.left, top: menuPos.top, minWidth: menuPos.width }}
                        role="listbox"
                    >
                        {ICON_OPTIONS.map((opt) => {
                            const selected = value === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        "w-full flex items-center justify-between px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold transition-[background,border-color] cursor-pointer border " +
                                        (selected
                                            ? "bg-white/[0.07] border-white/[0.16] text-white"
                                            : "bg-transparent border-transparent text-white/90 hover:bg-white/[0.045] hover:border-white/[0.10]")
                                    }
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                >
                                    <span>{opt.label}</span>
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
