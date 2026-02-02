"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PanelShell } from "../../features/panel/components/panel-shell";

export function PanelPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

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
          router.replace("/login");
          return;
        }
        setIsReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isReady) return null;

  return <PanelShell />;
}
