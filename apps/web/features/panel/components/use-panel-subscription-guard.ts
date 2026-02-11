import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSubscriptionQuery } from "../hooks/use-subscription-query";
import { usePanelTab } from "../hooks/use-panel-tab";
import { showToast } from "../toast";
import type { SettingsTabKey } from "../state/settings-tab";

export function usePanelSubscriptionGuard() {
    const { tab, setTab } = usePanelTab();
    const subQ = useSubscriptionQuery();
    const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("personalization");
    const blockedToastRef = useRef<string>("");
    const postAuthRef = useRef(false);
    const suppressBlockedToastOnceRef = useRef(false);

    const isVip = useMemo(() => {
        const st = String(subQ.data?.status || "").toLowerCase();
        return st === "vip";
    }, [subQ.data?.status]);

    const isSubSettled = subQ.isSuccess || subQ.isError;
    const isRestrictedTab = tab === "panel" || tab === "builder";
    const isBlockedRestrictedTab = isSubSettled && isRestrictedTab && !isVip;
    const isPendingRestrictedTab = !isSubSettled && isRestrictedTab;

    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            const v = localStorage.getItem("webrat_post_auth") || "";
            if (v === "1" || v === "true" || v === "on") {
                postAuthRef.current = true;
                suppressBlockedToastOnceRef.current = true;
            }
            localStorage.removeItem("webrat_post_auth");
        } catch {
        }
    }, []);

    const displayTab = isBlockedRestrictedTab || isPendingRestrictedTab ? "shop" : tab;

    const guardedSetTab = useCallback(
        (next: Parameters<typeof setTab>[0]) => {
            if (typeof next !== "string") return;
            const restrictedNext = next === "panel" || next === "builder";
            if (isSubSettled && !isVip && restrictedNext) {
                if (suppressBlockedToastOnceRef.current) {
                    suppressBlockedToastOnceRef.current = false;
                } else {
                    try {
                        showToast("Error", "You do not have Premium subscription");
                    } catch {
                    }
                }
                try {
                    setTab("shop");
                } catch {
                }
                return;
            }
            setTab(next);
        },
        [isSubSettled, isVip, setTab],
    );

    useEffect(() => {
        if (!isSubSettled) return;

        if (postAuthRef.current) {
            postAuthRef.current = false;
            if (isVip) {
                setTab("panel");
            } else {
                setTab("shop");
            }
            return;
        }

        if (!isVip && isRestrictedTab) {
            const key = String(tab || "");
            if (blockedToastRef.current !== key) {
                blockedToastRef.current = key;
                if (suppressBlockedToastOnceRef.current) {
                    suppressBlockedToastOnceRef.current = false;
                } else {
                    try {
                        showToast("Error", "You do not have Premium subscription");
                    } catch {
                    }
                }
            }
            setTab("shop");
        }
    }, [isRestrictedTab, isSubSettled, isVip, setTab, tab]);

    useEffect(() => {
        if (tab !== "settings") {
            setSettingsTab("personalization");
        }
    }, [tab]);

    return {
        tab,
        displayTab,
        guardedSetTab,
        settingsTab,
        setSettingsTab,
        isPendingRestrictedTab,
        isSubSettled,
    };
}
