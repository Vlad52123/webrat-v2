"use client";

import type { SettingsState } from "../../provider";

export function BackgroundPreview(props: { state: SettingsState }) {
    const { state } = props;

    return (
        <div
            className="h-[220px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(12,12,12,0.5)] shadow-[0_18px_54px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] md:h-[330px]"
            aria-label="Background preview"
        >
            <div
                id="settingsBgPreview"
                className="h-full w-full cursor-pointer border border-white/[0.10] bg-[rgba(22,22,22,0.65)] bg-center bg-no-repeat [background-size:contain]"
                role="button"
                tabIndex={0}
                onClick={() => {
                    if (state.bgMode === "image") {
                        try {
                            document.getElementById("settingsBgFile")?.click();
                        } catch {
                            return;
                        }
                    }
                    if (state.bgMode === "video") {
                        try {
                            document.getElementById("settingsBgVideoFile")?.click();
                        } catch {
                            return;
                        }
                    }

                    if (state.bgMode === "default") {
                        try {
                            document.getElementById("settingsBgColor")?.click();
                        } catch {
                            return;
                        }
                    }
                }}
            />
        </div>
    );
}
