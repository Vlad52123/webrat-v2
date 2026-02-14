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

function ShimmerSkeleton() {
    return (
        <div className="tg-section tg-fade-in">
            <div className="tg-hero" style={{ padding: 24 }}>
                <div className="tg-shimmer tg-shimmer-line short" style={{ margin: "0 auto 8px" }} />
                <div className="tg-shimmer tg-shimmer-balance" />
                <div className="tg-shimmer tg-shimmer-line short" style={{ margin: "8px auto 0", width: "40%" }} />
            </div>
            <div style={{ marginTop: 16 }}>
                <div className="tg-card">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="tg-stat-row">
                            <div className="tg-shimmer tg-shimmer-line" style={{ width: "35%", marginBottom: 0 }} />
                            <div className="tg-shimmer tg-shimmer-line" style={{ width: "25%", marginBottom: 0 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


function HomeScreen({ profile, loading, onRefresh, username }: {
    profile: Profile | null;
    loading: boolean;
    onRefresh: () => void;
    username?: string;
}) {
    if (loading && !profile) {
        return <ShimmerSkeleton />;
    }

    const initial = username ? username.charAt(0).toUpperCase() : "?";

    return (
        <div className="tg-section">
            {/* Header */}
            <div className="tg-header tg-fade-in">
                <div>
                    <div className="tg-header-greeting">
                        {getGreeting()}, {username || "пользователь"}
                    </div>
                    <div className="tg-header-title">
                        <span className="tg-header-logo">💎</span>
                        WebCrystal
                    </div>
                </div>
                <div className="tg-header-avatar">{initial}</div>
            </div>

            {/* Hero Balance */}
            <div className="tg-hero tg-fade-in tg-stagger-1" onClick={onRefresh} style={{ marginTop: 16 }}>
                <div className="tg-hero-label">Баланс</div>
                <div className="tg-hero-balance">
                    {loading ? "..." : `${(profile?.balance ?? 0).toFixed(0)} ₽`}
                </div>
                <div className="tg-hero-hint">Нажми для обновления</div>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 14 }}>
                <div className="tg-card tg-fade-in tg-stagger-2">
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

/* ── Shop Screen ────────────────────────────── */

function ShopScreen({ balance, onBuy, buying }: {
    balance: number;
    onBuy: (plan: "month" | "year" | "forever") => void;
    buying: boolean;
}) {
    const plans: { plan: "month" | "year" | "forever"; icon: string; title: string; desc: string; price: number; popular?: boolean }[] = [
        { plan: "month", icon: "⏱", title: "Месяц", desc: "30 дней доступа", price: 299 },
        { plan: "year", icon: "⭐", title: "Год", desc: "365 дней доступа", price: 599, popular: true },
        { plan: "forever", icon: "♾️", title: "Навсегда", desc: "Пожизненный доступ", price: 1299 },
    ];

    return (
        <div className="tg-section">
            <div className="tg-section-title tg-fade-in">💎 WebCrystal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plans.map((p, i) => (
                    <button
                        key={p.plan}
                        className={`tg-plan tg-fade-in tg-stagger-${i + 1} ${p.popular ? "tg-plan-popular" : ""}`}
                        onClick={() => onBuy(p.plan)}
                        disabled={buying}
                    >
                        <div>
                            <div className="tg-plan-title">
                                <span>{p.icon}</span>
                                {p.title}
                                {p.popular && <span className="tg-plan-badge">🔥 Выгодно</span>}
                            </div>
                            <div className="tg-plan-desc">{p.desc}</div>
                        </div>
                        <div className="tg-plan-price">{p.price} ₽</div>
                    </button>
                ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
                <div className="tg-balance-chip tg-fade-in tg-stagger-4">
                    💰 Баланс: {balance.toFixed(0)} ₽
                </div>
            </div>
        </div>
    );
}

/* ── Deposit Screen ─────────────────────────── */

function DepositScreen({ onDeposit, depositing }: {
    onDeposit: (amount: number) => void;
    depositing: boolean;
}) {
    const [amount, setAmount] = useState("");
    const presets = [100, 300, 500, 1000, 2000, 5000];
    const numAmount = parseInt(amount) || 0;

    return (
        <div className="tg-section">
            <div className="tg-section-title tg-fade-in">💳 Пополнение</div>

            <div className="tg-preset-grid tg-fade-in tg-stagger-1">
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

            <div className="tg-fade-in tg-stagger-2">
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
            </div>

            <div className="tg-deposit-hint tg-fade-in tg-stagger-3">
                От 50 до 1 000 000 ₽
            </div>

            <button
                className="tg-btn tg-btn-primary tg-fade-in tg-stagger-3"
                style={{ marginTop: 16 }}
                disabled={depositing || numAmount < 50 || numAmount > 1000000}
                onClick={() => onDeposit(numAmount)}
            >
                {depositing ? "Создание..." : `Пополнить ${numAmount > 0 ? numAmount + " ₽" : ""}`}
            </button>
        </div>
    );
}

/* ── Purchases Screen ───────────────────────── */

function PurchasesScreen({ purchases, loading }: { purchases: Purchase[]; loading: boolean }) {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const copyKey = (key: string, idx: number) => {
        navigator.clipboard?.writeText(key).catch(() => { });
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    };

    if (loading) {
        return (
            <div className="tg-loading">
                <div className="tg-spinner" />
                <div className="tg-loading-text">Загрузка покупок...</div>
            </div>
        );
    }

    if (purchases.length === 0) {
        return (
            <div className="tg-empty tg-fade-in">
                <div className="tg-empty-icon">📭</div>
                <div className="tg-empty-text">Покупок пока нет</div>
            </div>
        );
    }

    return (
        <div className="tg-section">
            <div className="tg-section-title tg-fade-in">🧾 Покупки</div>
            {purchases.map((p, i) => (
                <div key={i} className={`tg-purchase tg-fade-in tg-stagger-${Math.min(i + 1, 5)}`}>
                    <div className="tg-purchase-product">{p.product}</div>
                    <div className="tg-purchase-meta">
                        <span>{p.price.toFixed(0)} ₽</span>
                        <span>{p.createdAt}</span>
                    </div>
                    {p.activationKey && (
                        <div
                            className={`tg-purchase-key ${copiedIdx === i ? "tg-copied" : ""}`}
                            onClick={() => copyKey(p.activationKey, i)}
                        >
                            🔑 {p.activationKey}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Info Screen ────────────────────────────── */

function InfoScreen() {
    const { openLink } = useTelegram();

    return (
        <div className="tg-section">
            <div className="tg-section-title tg-fade-in">📚 Информация</div>

            <div className="tg-info-link tg-fade-in tg-stagger-1" onClick={() => openLink("https://webcrystal.sbs/")}>
                <span style={{ fontSize: 26 }}>🌐</span>
                <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Наш сайт</div>
                    <div style={{ fontSize: 12, color: "var(--tg-text-dim)", marginTop: 2 }}>webcrystal.sbs</div>
                </div>
            </div>

            <div className="tg-info-link tg-fade-in tg-stagger-2" onClick={() => openLink("https://t.me/WebCrystalbot")}>
                <span style={{ fontSize: 26 }}>🤖</span>
                <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Бот покупок</div>
                    <div style={{ fontSize: 12, color: "var(--tg-text-dim)", marginTop: 2 }}>@WebCrystalbot</div>
                </div>
            </div>

            <div className="tg-card tg-features-card tg-fade-in tg-stagger-3">
                <div className="tg-feature-item">
                    <span className="tg-feature-icon">✅</span>
                    <span>Работает на сайте — без лаунчеров и десктопных панелей</span>
                </div>
                <div className="tg-feature-item">
                    <span className="tg-feature-icon">✅</span>
                    <span>Не нужны хостинги и открытые порты, всё готово к работе</span>
                </div>
                <div className="tg-feature-item">
                    <span className="tg-feature-icon">✅</span>
                    <span>Билд на Go — не нужна Java или .NET Framework</span>
                </div>
                <div className="tg-feature-item">
                    <span className="tg-feature-icon">💡</span>
                    <span style={{ color: "var(--tg-text-muted)", fontStyle: "italic" }}>
                        Не открывается — используйте VPN
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ── Success Screen ─────────────────────────── */

function SuccessScreen({ product, activationKey, onDone }: {
    product: string;
    activationKey: string;
    onDone: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const copyKey = () => {
        navigator.clipboard?.writeText(activationKey).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="tg-success-screen">
            <div className="tg-success-icon">🎉</div>
            <div className="tg-success-title">Оплата прошла успешно!</div>
            <div className="tg-success-subtitle">{product}</div>
            <div
                className={`tg-success-key ${copied ? "tg-copied" : ""}`}
                onClick={copyKey}
            >
                {activationKey}
            </div>
            <div style={{ fontSize: 12, color: "var(--tg-text-muted)", marginBottom: 24 }}>
                Нажми на ключ чтобы скопировать
            </div>
            <button className="tg-btn tg-btn-primary" onClick={onDone}>
                Готово
            </button>
        </div>
    );
}

/* ── Bottom Navigation ──────────────────────── */

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

/* ── Helpers ─────────────────────────────────── */

function getGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Доброе утро";
    if (h >= 12 && h < 17) return "Добрый день";
    if (h >= 17 && h < 22) return "Добрый вечер";
    return "Доброй ночи";
}

/* ── Main App ────────────────────────────────── */

function TgApp() {
    const { ready, user } = useTelegram();
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
                    <div className="tg-loading-text">Загрузка...</div>
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
                <HomeScreen
                    profile={profile}
                    loading={loadingProfile}
                    onRefresh={loadProfile}
                    username={user?.firstName || user?.username}
                />
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

    if (!isTelegram) {
        return null;
    }

    return (
        <TelegramProvider>
            <TgApp />
        </TelegramProvider>
    );
}