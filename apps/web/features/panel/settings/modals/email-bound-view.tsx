"use client";

import { useState } from "react";

const btnCls =
    "min-w-[130px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]";
const inputCls =
    "h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]";

export function EmailBoundView({
    currentEmail,
    onDetach,
}: {
    currentEmail: string;
    onDetach: (password: string) => void;
}) {
    const [confirmUnbind, setConfirmUnbind] = useState(false);
    const [unbindPassword, setUnbindPassword] = useState("");

    return (
        <div className="grid gap-[12px] p-[18px]">
            <div className="text-center text-[14px] text-white/[0.7]">Current email:</div>
            <div className="text-center text-[16px] font-bold text-white">{currentEmail}</div>
            {!confirmUnbind ? (
                <div className="mt-[8px] flex justify-center">
                    <button
                        id="emailUnbindBtn"
                        className={btnCls.replace("bg-white/[0.10]", "bg-[rgba(255,75,75,0.12)]").replace("border-white/[0.18]", "border-[rgba(255,75,75,0.35)]")}
                        style={{ borderBottomColor: "rgba(255,75,75,0.95)", color: "#ff7070" }}
                        type="button"
                        onClick={() => setConfirmUnbind(true)}
                    >
                        Unbind
                    </button>
                </div>
            ) : (
                <div className="grid gap-[10px]">
                    <input
                        id="emailUnbindPassword"
                        className={inputCls}
                        type="password"
                        placeholder="Enter password to confirm"
                        value={unbindPassword}
                        onChange={(e) => setUnbindPassword(e.target.value)}
                    />
                    <div className="flex justify-center gap-[10px]">
                        <button
                            className={btnCls.replace("bg-white/[0.10]", "bg-[rgba(255,75,75,0.12)]").replace("border-white/[0.18]", "border-[rgba(255,75,75,0.35)]")}
                            style={{ borderBottomColor: "rgba(255,75,75,0.95)", color: "#ff7070" }}
                            type="button"
                            onClick={() => onDetach(unbindPassword)}
                        >
                            Unbind
                        </button>
                        <button
                            className={btnCls}
                            style={{ borderBottomColor: "var(--line)" }}
                            type="button"
                            onClick={() => {
                                setConfirmUnbind(false);
                                setUnbindPassword("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}