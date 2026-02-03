"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/health", { method: "GET", credentials: "include" });
      } catch {
        return;
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}