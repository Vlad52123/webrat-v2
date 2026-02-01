"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AppPage() {
  const router = useRouter();

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
        }
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">App</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder. Next step: перенесём экраны и логику из oldproject по модулям.
        </p>
      </div>
    </div>
  );
}