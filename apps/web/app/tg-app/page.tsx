"use client";

import { useCallback, useEffect, useState } from "react";
import { TelegramProvider, useTelegram } from "@/features/tg-app/context";
import { useTgApi } from "@/features/tg-app/api";

type Tab = "home" | "shop" | "deposit" | "purchases" | "info";

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

function useToast() {
    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const show = useCallback((type: "success" | "error", text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const el = toast ? (
        <div className={`tg-toast tg-toast-${toast.type}`}>{toast.text}</div>
    ) : null;

    return { show, el };
}

function HomeScreen({ profile, loading, onRefresh }: {
    profile: Profile | null;
    loading: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="tg-section">
            <div className="tg-hero" onClick={onRefresh}>
                <div className="tg-hero-label">Баланс</div>
                <div className="tg-hero-balance">
                    {loading ? "..." : `${(profile?.balance ?? 0).toFixed(0)} ₽`}
                </div>
                <div style={{ fontSize: 12, color: "var(--tg-text-muted)", marginTop: 4 }}>
                    Нажми для обновления
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <div className="tg-card" style={{ marginBottom: 8 }}>
                    <div className="tg-stat-row">
                        <span className="tg-stat-label">🔑 ID</span>
                        <span className="tg-stat-value">{profile?.telegramId ?? "-"}</span>
                    </div>
                    <div className="tg-stat-row">
                        <span className="tg-stat-label">👤 Логин</span>
                        <span className="tg-stat-value">{profile?.login ?? "-"}</span>
                    </div>
                    <div className="tg-stat-row">
                        <span className="tg-stat-label">💵 Пополнено</span>
                        <span className="tg-stat-value">{(profile?.totalPaid ?? 0).toFixed(0)} ₽</span>
                    </div>
                    <div className="tg-stat-row">
                        <span className="tg-stat-label">🎁 Покупки</span>
                        <span className="tg-stat-value">{profile?.ordersCount ?? 0} шт.</span>
                    </div>
                    <div className="tg-stat-row">
                        <span className="tg-stat-label">🕜 Регистрация</span>
                        <span className="tg-stat-value">{profile?.registeredAt ?? "-"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShopScreen({ balance, onBuy, buying }: {
    balance: number;
    onBuy: (plan: "month" | "year" | "forever") => void;
    buying: boolean;
}) {
    const plans: { plan: "month" | "year" | "forever"; title: string; desc: string; price: number; popular?: boolean }[] = [
        { plan: "month", title: "Месяц", desc: "30 дней доступа", price: 299 },
        { plan: "year", title: "Год", desc: "365 дней доступа", price: 599, popular: true },
        { plan: "forever", title: "Навсегда", desc: "Пожизненный доступ", price: 1299 },
    ];

    return (
        <div className="tg-section">
            <div className="tg-section-title">💎 WebCrystal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plans.map((p) => (
                    <button
                        key={p.plan}
                        className={`tg-plan ${p.popular ? "tg-plan-popular" : ""}`}
                        onClick={() => onBuy(p.plan)}
                        disabled={buying}
                    >
                        <div>
                            <div className="tg-plan-title">
                                {p.title}
                                {p.popular && <span className="tg-plan-badge">Выгодно</span>}
                            </div>
                            <div className="tg-plan-desc">{p.desc}</div>
                        </div>
                        <div className="tg-plan-price">{p.price} ₽</div>
                    </button>
                ))}
            </div>
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--tg-text-muted)" }}>
                Баланс: {balance.toFixed(0)} ₽
            </div>
        </div>
    );
}

function DepositScreen({ onDeposit, depositing }: {
    onDeposit: (amount: number) => void;
    depositing: boolean;
}) {
    const [amount, setAmount] = useState("");
    const presets = [100, 300, 500, 1000, 2000, 5000];
    const numAmount = parseInt(amount) || 0;

    return (
        <div className="tg-section">
            <div className="tg-section-title">💳 Пополнение</div>

            <div className="tg-preset-grid">
                {presets.map((p) => (
                    <button
                        key={p}
                        className={`tg-preset ${numAmount === p ? "active" : ""}`}
                        onClick={() => setAmount(String(p))}
                    >
                        {p} ₽
                    </button>
                ))}
            </div>

            <input
                className="tg-input"
                type="number"
                inputMode="numeric"
                placeholder="Сумма (₽)"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                min="50"
                max="1000000"
            />

            <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "var(--tg-text-muted)" }}>
                От 50 до 1 000 000 ₽
            </div>

            <button
                className="tg-btn tg-btn-primary"
                style={{ marginTop: 16 }}
                disabled={depositing || numAmount < 50 || numAmount > 1000000}
                onClick={() => onDeposit(numAmount)}
            >
                {depositing ? "Создание..." : `Пополнить ${numAmount > 0 ? numAmount + " ₽" : ""}`}
            </button>
        </div>
    );
}

function PurchasesScreen({ purchases, loading }: { purchases: Purchase[]; loading: boolean }) {
    if (loading) {
        return <div className="tg-loading"><div className="tg-spinner" /></div>;
    }

    if (purchases.length === 0) {
        return (
            <div className="tg-empty">
                <div className="tg-empty-icon">📭</div>
                <div className="tg-empty-text">Покупок пока нет</div>
            </div>
        );
    }

    return (
        <div className="tg-section">
            <div className="tg-section-title">🧾 Покупки</div>
            {purchases.map((p, i) => (
                <div key={i} className="tg-purchase">
                    <div className="tg-purchase-product">{p.product}</div>
                    <div className="tg-purchase-meta">
                        <span>{p.price.toFixed(0)} ₽</span>
                        <span>{p.createdAt}</span>
                    </div>
                    {p.activationKey && (
                        <div className="tg-purchase-key">🔑 {p.activationKey}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

function InfoScreen() {
    const { openLink } = useTelegram();

    return (
        <div className="tg-section">
            <div className="tg-section-title">📚 Информация</div>

            <div className="tg-info-link" onClick={() => openLink("https://webcrystal.sbs/")}>
                <span style={{ fontSize: 24 }}>🌐</span>
                <div>
                    <div style={{ fontWeight: 700, color: "#fff" }}>Наш сайт</div>
                    <div style={{ fontSize: 12, color: "var(--tg-text-dim)" }}>webcrystal.sbs</div>
                </div>
            </div>

            <div className="tg-info-link" onClick={() => openLink("https://t.me/WebCrystalbot")}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div>
                    <div style={{ fontWeight: 700, color: "#fff" }}>Бот покупок</div>
                    <div style={{ fontSize: 12, color: "var(--tg-text-dim)" }}>@WebCrystalbot</div>
                </div>
            </div>

            <div className="tg-card" style={{ marginTop: 12, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--tg-text-dim)", lineHeight: 1.6 }}>
                    ✅ Работает на сайте, без лаунчеров<br />
                    ✅ Не нужны хостинги и порты<br />
                    ✅ Билд на Go — не нужна Java/.NET<br />
                    <br />
                    <em style={{ color: "var(--tg-text-muted)" }}>Не открывается — используйте VPN</em>
                </div>
            </div>
        </div>
    );
}

function SuccessScreen({ product, activationKey, onDone }: {
    product: string;
    activationKey: string;
    onDone: () => void;
}) {
    return (
        <div className="tg-success-screen">
            <div className="tg-success-icon">✅</div>
            <div className="tg-success-title">Оплата прошла успешно!</div>
            <div style={{ fontSize: 14, color: "var(--tg-text-dim)", marginTop: 4 }}>{product}</div>
            <div className="tg-success-key">{activationKey}</div>
            <div style={{ fontSize: 12, color: "var(--tg-text-muted)", marginBottom: 20 }}>
                Нажми на ключ чтобы скопировать
            </div>
            <button className="tg-btn tg-btn-primary" onClick={onDone}>
                Готово
            </button>
        </div>
    );
}

const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "🏠", label: "Главная" },
    { id: "shop", icon: "💎", label: "Магазин" },
    { id: "deposit", icon: "💳", label: "Баланс" },
    { id: "purchases", icon: "🧾", label: "Покупки" },
    { id: "info", icon: "📚", label: "Инфо" },
];

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
    const { haptic } = useTelegram();
    return (
        <div className="tg-bottom-bar">
            {TABS.map((t) => (
                <button
                    key={t.id}
                    className={`tg-tab ${active === t.id ? "active" : ""}`}
                    onClick={() => {
                        haptic("light");
                        onChange(t.id);
                    }}
                >
                    <span className="tg-tab-icon">{t.icon}</span>
                    <span className="tg-tab-label">{t.label}</span>
                </button>
            ))}
        </div>
    );
}

function TgApp() {
    const { ready } = useTelegram();
    const api = useTgApi();
    const toast = useToast();

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
            toast.show("error", e.message || "Ошибка загрузки профиля");
        } finally {
            setLoadingProfile(false);
        }
    }, [api, toast]);

    const loadPurchases = useCallback(async () => {
        try {
            setLoadingPurchases(true);
            const data = await api.getPurchases();
            setPurchases(data.purchases || []);
        } catch (e: any) {
            toast.show("error", e.message || "Ошибка загрузки покупок");
        } finally {
            setLoadingPurchases(false);
        }
    }, [api, toast]);

    useEffect(() => {
        if (ready) {
            loadProfile();
        }
    }, [ready]);

    useEffect(() => {
        if (tab === "purchases" && ready) {
            loadPurchases();
        }
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
            toast.show("error", e.message === "insufficient funds" ? "Недостаточно средств" : (e.message || "Ошибка покупки"));
        } finally {
            setBuying(false);
        }
    }, [api, toast, loadProfile]);

    const handleDeposit = useCallback(async (amount: number) => {
        try {
            setDepositing(true);
            const res = await api.createDeposit(amount);
            if (res.payUrl) {
                window.Telegram?.WebApp?.openLink(res.payUrl);
                toast.show("success", `Счёт на ${amount} ₽ создан`);
            }
        } catch (e: any) {
            toast.show("error", e.message || "Ошибка создания счёта");
        } finally {
            setDepositing(false);
        }
    }, [api, toast]);

    if (!ready) {
        return (
            <div className="tg-app">
                <div className="tg-loading" style={{ minHeight: "100dvh" }}>
                    <div className="tg-spinner" />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="tg-app">
                {toast.el}
                <SuccessScreen
                    product={success.product}
                    activationKey={success.activationKey}
                    onDone={() => {
                        setSuccess(null);
                        setTab("home");
                    }}
                />
            </div>
        );
    }

    return (
        <div className="tg-app">
            {toast.el}

            {tab === "home" && (
                <HomeScreen profile={profile} loading={loadingProfile} onRefresh={loadProfile} />
            )}
            {tab === "shop" && (
                <ShopScreen balance={profile?.balance ?? 0} onBuy={handleBuy} buying={buying} />
            )}
            {tab === "deposit" && (
                <DepositScreen onDeposit={handleDeposit} depositing={depositing} />
            )}
            {tab === "purchases" && (
                <PurchasesScreen purchases={purchases} loading={loadingPurchases} />
            )}
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

    // Not yet determined or not Telegram — show nothing
    if (!isTelegram) {
        return null;
    }

    return (
        <TelegramProvider>
            <TgApp />
        </TelegramProvider>
    );
}