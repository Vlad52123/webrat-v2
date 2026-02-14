"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        username?: string;
                        first_name?: string;
                        last_name?: string;
                        language_code?: string;
                    };
                };
                ready: () => void;
                expand: () => void;
                close: () => void;
                MainButton: {
                    text: string;
                    show: () => void;
                    hide: () => void;
                    onClick: (cb: () => void) => void;
                };
                themeParams: Record<string, string>;
                colorScheme: "dark" | "light";
                openLink: (url: string) => void;
                HapticFeedback: {
                    impactOccurred: (style: "light" | "medium" | "heavy") => void;
                    notificationOccurred: (type: "error" | "success" | "warning") => void;
                };
            };
        };
    }
}

interface TelegramContextValue {
    initData: string;
    user: {
        id: number;
        username?: string;
        firstName?: string;
        lastName?: string;
    } | null;
    ready: boolean;
    haptic: (style?: "light" | "medium" | "heavy") => void;
    openLink: (url: string) => void;
}

const TelegramContext = createContext<TelegramContextValue>({
    initData: "",
    user: null,
    ready: false,
    haptic: () => { },
    openLink: () => { },
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [initData, setInitData] = useState("");
    const [user, setUser] = useState<TelegramContextValue["user"]>(null);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.ready();
        tg.expand();

        setInitData(tg.initData);

        const u = tg.initDataUnsafe?.user;
        if (u) {
            setUser({
                id: u.id,
                username: u.username,
                firstName: u.first_name,
                lastName: u.last_name,
            });
        }

        setReady(true);
    }, []);

    const haptic = (style: "light" | "medium" | "heavy" = "light") => {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    };

    const openLink = (url: string) => {
        window.Telegram?.WebApp?.openLink(url);
    };

    return (
        <TelegramContext.Provider value={{ initData, user, ready, haptic, openLink }}>
            {children}
        </TelegramContext.Provider>
    );
}