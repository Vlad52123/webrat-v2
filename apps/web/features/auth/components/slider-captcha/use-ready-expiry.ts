import { useEffect } from "react";

export function useReadyExpiry(p: {
    readyUntilRef: React.MutableRefObject<number>;
    onReadyChange: (ready: boolean) => void;
    initCaptcha: () => Promise<void> | void;
}) {
    const { readyUntilRef, onReadyChange, initCaptcha } = p;

    useEffect(() => {
        if (!readyUntilRef.current) return;
        const t = window.setInterval(() => {
            if (readyUntilRef.current && Date.now() > readyUntilRef.current) {
                readyUntilRef.current = 0;
                onReadyChange(false);
                void initCaptcha();
            }
        }, 1000);
        return () => window.clearInterval(t);
    }, [initCaptcha, onReadyChange, readyUntilRef]);
}
