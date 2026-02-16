import { useEffect } from "react";

import { readIcoAsBase64 } from "../../utils/icon";

type Params = {
    setIconBase64: (v: string) => void;
};

export function useBuilderIconInput(p: Params): void {
    const { setIconBase64 } = p;

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
    }, [setIconBase64]);
}
