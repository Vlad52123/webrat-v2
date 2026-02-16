"use client";

import { useEffect, useState } from "react";

import { BuilderForm } from "../builder/components/builder-form";
import { BuilderToggle } from "../builder/components/builder-toggle";
import { BuildsList } from "../builder/components/builds/builds-list";
import { makeMutex } from "../builder/utils/make-mutex";


export function BuilderScreen() {
    const [open, setOpen] = useState(false);
    const [mutex] = useState(() => makeMutex());
    const [hasCustomBg, setHasCustomBg] = useState(false);

    useEffect(() => {

        const sync = () => {
            try {
                const cls = document.body.classList;
                setHasCustomBg(cls.contains("hasCustomBg") && cls.contains("isBuilderTab"));
            } catch {
                setHasCustomBg(false);
            }
        };

        sync();
        try {
            const obs = new MutationObserver(sync);
            obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
            return () => obs.disconnect();
        } catch {
            return;
        }
    }, []);

    return (
        <div id="builderView" className="view h-full overflow-auto">
            <div
                className={
                    hasCustomBg
                        ? "builderPage mx-auto mt-[20px] mb-[24px] w-full max-w-[1040px] rounded-[18px] bg-[rgba(0,0,0,0.22)] px-[24px]"
                        : "builderPage mx-auto mt-[20px] mb-[24px] w-full max-w-[1040px] px-[24px]"
                }
            >
                <div className="mb-[20px] text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.55)]" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>Builder</div>
                </div>
                <BuilderToggle open={open} onToggle={() => setOpen((v) => !v)} />
                <BuilderForm open={open} mutex={mutex} />

                <BuildsList />

                <div id="buildModal" className="fixed inset-0 z-[2000] grid place-items-center bg-[rgba(0,0,0,0.62)] backdrop-blur-[10px]" hidden
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            (e.currentTarget as HTMLDivElement).hidden = true;
                        }
                    }}
                >
                    <div
                        className="grid w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.18)] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Build saved"
                    >
                        <div className="flex items-center justify-between px-[14px] py-[12px] border-b border-[rgba(255,255,255,0.2)]">
                            <div className="text-[15px] font-bold text-white">build ready</div>
                            <button
                                id="buildModalClose"
                                className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[18px] leading-none text-[rgba(255,255,255,0.95)] transition-[background,border-color,transform] duration-[140ms] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.22)] active:translate-y-[1px]"
                                type="button"
                                aria-label="Close"
                                onClick={() => {
                                    const m = document.getElementById("buildModal");
                                    if (m) (m as HTMLDivElement).hidden = true;
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="grid gap-[12px] p-[18px]">
                            <div className="text-center text-[18px] font-black text-white">BUILD SAVED</div>
                            <div className="text-center text-[13px] text-[rgba(255,255,255,0.9)]">ARCHIVE PASSWORD :</div>
                            <div
                                id="buildModalPass"
                                className="h-[38px] grid place-items-center rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(0,0,0,0.28)] font-mono text-[14px] text-white text-center select-all"
                            >
                                ----
                            </div>
                            <div className="mt-[8px] flex justify-center">
                                <button
                                    id="buildModalOk"
                                    className="min-w-[150px] cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.18)] border-b-[4px] border-b-[var(--line)] bg-[rgba(255,255,255,0.1)] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] duration-[140ms] hover:bg-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.28)] active:translate-y-[1px]"
                                    type="button"
                                    onClick={() => {
                                        const m = document.getElementById("buildModal");
                                        if (m) (m as HTMLDivElement).hidden = true;
                                    }}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
