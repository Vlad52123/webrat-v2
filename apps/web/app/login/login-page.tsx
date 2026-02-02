"use client";

import { useEffect } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { applySnow } from "@/features/panel/settings/snow";

export function LoginPage() {
  useEffect(() => {
    try {
      applySnow(true);
    } catch {
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120a22] text-white">
      <main className="relative z-10 grid min-h-screen place-items-center p-[18px]">
        <div className="relative flex w-[min(460px,92vw)] flex-col items-center justify-center">
          <div className="grid w-full place-items-center pb-0 mb-[-78px]">
            <img
              className="mt-2 h-[220px] w-auto select-none [image-rendering:pixelated]"
              src="/logo/register_logo.ico"
              alt="WebCrystal"
              draggable={false}
            />
          </div>

          <section
            className="relative mt-[-8px] w-[min(460px,92vw)] overflow-hidden rounded-[18px] border border-[rgba(214,154,255,0.34)] bg-[radial-gradient(900px_500px_at_20%_0%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_60%),linear-gradient(180deg,rgba(18,10,34,0.52)_0%,rgba(12,8,24,0.36)_100%)] p-[12px_16px_14px] shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_18px_60px_rgba(186,85,211,0.12)] backdrop-blur-[16px]"
            aria-label="Login"
          >
            <div className="pointer-events-none absolute inset-[-1px] rounded-[18px] opacity-45 [background:linear-gradient(135deg,rgba(235,200,255,0.40),rgba(117,61,255,0.10),rgba(255,120,210,0.18))] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] [padding:1px]" />
            <LoginForm />
          </section>
        </div>
      </main>
    </div>
  );
}