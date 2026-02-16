import { useTelegram } from "./context";

const API_BASE = "/api/tg";

export async function tgFetch<T = any>(
    path: string,
    initData: string,
    options?: RequestInit,
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
            ...(options?.headers || {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export function useTgApi() {
    const { initData } = useTelegram();

    return {
        getProfile: () => tgFetch<{
            telegramId: number;
            login: string;
            registeredAt: string;
            balance: number;
            totalPaid: number;
            ordersCount: number;
        }>("/profile", initData),

        getPurchases: () => tgFetch<{
            purchases: Array<{
                product: string;
                price: number;
                activationKey: string;
                createdAt: string;
            }>;
        }>("/purchases", initData),

        createDeposit: (amount: number) =>
            tgFetch<{ invoiceId: string; payUrl: string; amount: number }>(
                "/deposit", initData, { method: "POST", body: JSON.stringify({ amount }) },
            ),

        buyPlan: (plan: "month" | "year" | "forever") =>
            tgFetch<{ success: boolean; product: string; price: number; activationKey: string }>(
                "/buy", initData, { method: "POST", body: JSON.stringify({ plan }) },
            ),
    };
}
