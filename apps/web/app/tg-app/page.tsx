"use client";

import { useCallback, useEffect, useState } from "react";
import { TelegramProvider, useTelegram } from "@/features/tg-app/context";
import { useTgApi } from "@/features/tg-app/api";
import { Toast, useToast } from "./components/toast";
import { BottomNav, type Tab } from "./components/bottom-nav";
import { HomeScreen } from "./components/home-screen";
import { ShopScreen } from "./components/shop-screen";
import { DepositScreen } from "./components/deposit-screen";
import { PurchasesScreen } from "./components/purchases-screen";
import { InfoScreen } from "./components/info-screen";
import { SuccessScreen } from "./components/success-screen";

interface Profile {
    telegramId: number;
    login: string;
    registeredAt: string;
    balance: number;
    totalPaid: number;
    ordersCount: number;
}

interface Purchase {
    product: string;
    price: number;
    activationKey: string;
    createdAt: string;
}

function TgApp() {
    const { ready, user } = useTelegram();
    const api = useTgApi();
    const { toast, show } = useToast();

    const [tab, setTab] = useState<Tab>("home");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [buying, setBuying] = useState(false);
    const [depositing, setDepositing] = useState(false);
    const [success, setSuccess] = useState<{ product: string; activationKey: string } | null>(null);

    const loadProfile = useCallback(async () => {
        try {
            setLoadingProfile(true);
            const p = await api.getProfile();
            setProfile(p);
        } catch (e: any) {
            show("error", e.message || "Failed to load profile");
        } finally {
            setLoadingProfile(false);
        }
    }, [api, show]);

    const loadPurchases = useCallback(async () => {
        try {
            setLoadingPurchases(true);
            const data = await api.getPurchases();
            setPurchases(data.purchases || []);
        } catch (e: any) {
            show("error", e.message || "Failed to load orders");
        } finally {
            setLoadingPurchases(false);
        }
    }, [api, show]);

    useEffect(() => {
        if (ready) loadProfile();
    }, [ready]);

    useEffect(() => {
        if (tab === "purchases" && ready) loadPurchases();
    }, [tab, ready]);

    const handleBuy = useCallback(async (plan: "month" | "year" | "forever") => {
        try {
            setBuying(true);
            const res = await api.buyPlan(plan);
            if (res.success) {
                setSuccess({ product: res.product, activationKey: res.activationKey });
                loadProfile();
            }
        } catch (e: any) {
            show("error", e.message === "insufficient funds" ? "Insufficient funds" : (e.message || "Purchase failed"));
        } finally {
            setBuying(false);
        }
    }, [api, show, loadProfile]);

    const handleDeposit = useCallback(async (amount: number) => {
        try {
            setDepositing(true);
            const res = await api.createDeposit(amount);
            if (res.payUrl) {
                window.Telegram?.WebApp?.openLink(res.payUrl);
                show("success", `Invoice for ${amount} ₽ created`);
            }
        } catch (e: any) {
            show("error", e.message || "Failed to create invoice");
        } finally {
            setDepositing(false);
        }
    }, [api, show]);

    if (!ready) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#07060b] font-sans text-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
                    <p className="text-[13px] text-white/20">Loading...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-dvh bg-[#07060b] font-sans text-white">
                <Toast toast={toast} />
                <SuccessScreen
                    product={success.product}
                    activationKey={success.activationKey}
                    onDone={() => { setSuccess(null); setTab("home"); }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-dvh overflow-x-hidden bg-[#07060b] pb-20 font-sans text-white">
            <Toast toast={toast} />
            {tab === "home" && <HomeScreen profile={profile} loading={loadingProfile} onRefresh={loadProfile} username={user?.firstName || user?.username} />}
            {tab === "shop" && <ShopScreen balance={profile?.balance ?? 0} onBuy={handleBuy} buying={buying} />}
            {tab === "deposit" && <DepositScreen onDeposit={handleDeposit} depositing={depositing} />}
            {tab === "purchases" && <PurchasesScreen purchases={purchases} loading={loadingPurchases} />}
            {tab === "info" && <InfoScreen />}
            <BottomNav active={tab} onChange={setTab} />
        </div>
    );
}

export default function TgAppPage() {
    const [isTelegram, setIsTelegram] = useState<boolean | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTelegram(!!window.Telegram?.WebApp?.initData);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isTelegram) return null;

    return (
        <TelegramProvider>
            <TgApp />
        </TelegramProvider>
    );
}