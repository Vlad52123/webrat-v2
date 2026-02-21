"use client";

import { type Dispatch, type RefObject, type SetStateAction } from "react";
import { createPortal } from "react-dom";

import { BUTTON_OPTIONS, type ButtonOptionValue } from "./button-options";
import { DROPDOWN_MENU, dropdownOptionCn } from "../../../../ui-classes";

interface Props {
    value: ButtonOptionValue;
    onChange: (value: ButtonOptionValue) => void;
    wrapRef: RefObject<HTMLDivElement | null>;
    btnRef: RefObject<HTMLButtonElement | null>;
    menuRef: RefObject<HTMLDivElement | null>;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    menuPos: { left: number; top: number; width: number } | null;
}

export function ButtonSelect({ value, onChange, wrapRef, btnRef, menuRef, open, setOpen, menuPos }: Props) {
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
                {BUTTON_OPTIONS.find((o) => o.value === value)?.label || "OK"}
                <span className="pointer-events-none">
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
                        className={DROPDOWN_MENU}
                        style={{ left: menuPos.left, top: menuPos.top, minWidth: menuPos.width }}
                        role="listbox"
                    >
                        {BUTTON_OPTIONS.map((opt) => {
                            const selected = value === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={dropdownOptionCn(selected)}
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
