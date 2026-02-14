import { useEffect, useRef, useState } from "react";

export function usePanelLoader(isPendingRestrictedTab: boolean) {
    const [loaderUntilTs, setLoaderUntilTs] = useState(0);
    const [loaderFadingOut, setLoaderFadingOut] = useState(false);
    const prevShouldShowLoaderRef = useRef(false);

    useEffect(() => {
        if (!isPendingRestrictedTab) return;
        if (loaderUntilTs) return;
        setLoaderUntilTs(Date.now() + 1000);
    }, [isPendingRestrictedTab, loaderUntilTs]);

    useEffect(() => {
        if (isPendingRestrictedTab) return;
        if (!loaderUntilTs) return;

        const remaining = loaderUntilTs - Date.now();
        if (remaining <= 0) {
            setLoaderUntilTs(0);
            return;
        }

        const t = window.setTimeout(() => setLoaderUntilTs(0), remaining);
        return () => window.clearTimeout(t);
    }, [isPendingRestrictedTab, loaderUntilTs]);

    const shouldShowLoader = (loaderUntilTs ? Date.now() < loaderUntilTs : false) || isPendingRestrictedTab;

    useEffect(() => {
        const prev = prevShouldShowLoaderRef.current;
        prevShouldShowLoaderRef.current = shouldShowLoader;

        if (shouldShowLoader) {
            if (loaderFadingOut) setLoaderFadingOut(false);
            return;
        }

        if (!prev) return;
        setLoaderFadingOut(true);
        const t = window.setTimeout(() => setLoaderFadingOut(false), 700);
        return () => window.clearTimeout(t);
    }, [loaderFadingOut, shouldShowLoader]);

    return { shouldShowLoader, loaderFadingOut };
}
