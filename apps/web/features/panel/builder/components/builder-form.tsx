import { useState } from "react";

import { BuilderField } from "./builder-field";
import { BuilderIconField } from "./builder-icon-field";
import { BuilderSelect } from "./builder-select";
import { BuilderStartupDelay } from "./builder-startup-delay";
import { BuilderTextInput } from "./builder-text-input";

export function BuilderForm(props: { open: boolean; mutex: string }) {
  const { open, mutex } = props;

  const [installMode, setInstallMode] = useState<string>("random");
  const [delay, setDelay] = useState<number>(2);

  return (
    <div id="builderForm" className="builderForm" hidden={!open}>
      <div className="rounded-[18px] border border-white/15 bg-black/30 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-md">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <BuilderField label="name">
              <BuilderTextInput id="buildName" placeholder="name" autoComplete="off" maxLength={25} />
            </BuilderField>

            <BuilderField label="mutex">
              <BuilderTextInput
                id="buildMutex"
                value={mutex}
                readOnly
                style={{ color: "gray" }}
              />
            </BuilderField>

            <BuilderField label="Comment">
              <BuilderTextInput id="buildComment" placeholder="comment" autoComplete="off" maxLength={10} />
            </BuilderField>

            <BuilderField label="Anti-analysis">
              <BuilderSelect id="antiAnalysis" defaultValue="None">
                <option value="None">None</option>
                <option value="AntiMitm">Anti Mitm</option>
                <option value="AntiVps">Anti VPS</option>
                <option value="Full">Full</option>
              </BuilderSelect>
            </BuilderField>

            <BuilderField label="Extension">
              <BuilderTextInput
                id="extension"
                value="webcrystal.exe"
                readOnly
                tabIndex={-1}
                style={{ color: "gray" }}
              />
            </BuilderField>

            <BuilderIconField />
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BuilderField label="Auto Steal">
                <BuilderSelect id="autoSteal" defaultValue="Once">
                  <option value="Once">Once</option>
                  <option value="Every connect">Every connect</option>
                </BuilderSelect>
              </BuilderField>

              <BuilderField label="Force admin">
                <BuilderSelect id="forceAdmin" defaultValue="Normal">
                  <option value="Normal">Normal</option>
                  <option value="Agressive">Agressive</option>
                </BuilderSelect>
              </BuilderField>

              <BuilderField label="Install">
                <BuilderSelect
                  id="installMode"
                  value={installMode}
                  onChange={(e) => setInstallMode(e.target.value)}
                >
                  <option value="random">Random</option>
                  <option value="custom">Custom</option>
                </BuilderSelect>
              </BuilderField>

              <div id="installPathRow" className="grid gap-2" hidden={installMode !== "custom"}>
                <span className="text-[12px] font-bold text-white/70">Path</span>
                <BuilderTextInput
                  id="installPath"
                  placeholder="$AppData\\build.exe"
                  autoComplete="off"
                />
              </div>
            </div>

            <BuilderStartupDelay
              delay={delay}
              onMinus={() => setDelay((v) => Math.max(0, v - 1))}
              onPlus={() => setDelay((v) => Math.min(999, v + 1))}
            />

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
  );
}
