"use client";

import { useEffect } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { applySnow } from "@/features/panel/settings/snow";

export function LoginPage() {
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }

        try {
            document.body.classList.add("isLoginSnow");
            applySnow(true);
        } catch {
        }

        return () => {
            try {
                document.body.classList.remove("isLoginSnow");
                applySnow(false);
            } catch {
            }
        };
    }, []);

    return (
        <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[#120a22] text-white">
            <main className="relative z-10 grid min-h-screen min-h-[100dvh] place-items-center overflow-y-auto p-[18px] py-[clamp(8px,2vh,18px)]">
                <div className="relative flex w-[min(460px,92vw)] flex-col items-center justify-center">
                    <div className="grid w-full place-items-center pb-0 mb-[clamp(-78px,-8vh,-30px)]">
                        <img
                            className="mt-2 h-[clamp(120px,22vh,220px)] w-auto select-none [image-rendering:pixelated] wc-no-copy"
                            src="/logo/register_logo.ico"
                            alt="WebCrystal"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                    </div>

                    <section
                        className="relative mt-[-8px] w-[min(460px,92vw)] overflow-visible rounded-[18px] border border-[rgba(255,255,255,0.16)] bg-[rgba(24,14,42,0.52)] p-[12px_16px_14px] shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-[14px]"
                        aria-label="Login"
                    >
                        <LoginForm />
                    </section>
                </div>
            </main>
        </div>
    );
}
