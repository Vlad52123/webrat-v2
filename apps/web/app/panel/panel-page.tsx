"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PanelShell } from "../../features/panel/components/panel-shell";

export function PanelPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/me`, {
          method: "GET",
          credentials: "include",
        });
        if (cancelled) return;
        if (!res.ok) {
          try {
            await fetch(`/api/logout`, { method: "POST", credentials: "include" });
          } catch {
          }
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          } else {
            router.replace("/login");
          }
          return;
        }
        setIsReady(true);
        setIsChecking(false);
      } catch {
        if (cancelled) return;
        try {
          await fetch(`/api/logout`, { method: "POST", credentials: "include" });
        } catch {
        }
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        } else {
          router.replace("/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#222222] text-white/80">
        <div className="grid place-items-center">
          <img
            src="/icons/loading.svg"
            alt="loading"
            draggable={false}
            className="h-[44px] w-[44px] animate-spin invert brightness-200"
          />
          <span className="sr-only">{isChecking ? "Checking session" : "Redirecting"}</span>
        </div>
      </div>
    );
  }

  return <PanelShell />;
}