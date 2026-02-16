"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

import { useHealthPing } from "./use-health-ping";
import { useInstallToastGlobal } from "./use-install-toast-global";
import { useLowPerfClass } from "./use-low-perf-class";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    useLowPerfClass();
    useHealthPing();
    useInstallToastGlobal();

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="bottom-right"
                expand
                visibleToasts={6}
                closeButton={false}
                gap={6}
                offset={{ bottom: 4, right: 4 }}
                mobileOffset={{ bottom: 4, right: 4 }}
            />
            {children}
        </QueryClientProvider>
    );
}
