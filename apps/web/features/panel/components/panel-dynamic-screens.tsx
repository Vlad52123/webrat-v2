import dynamic from "next/dynamic";

import { PanelScreen } from "../screens/panel-screen";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";

function PanelScreenFallback(props: { label: string }) {
    return (
        <div className="grid h-full w-full place-items-center text-white/70">
            <div className="grid place-items-center gap-2">
                <img
                    src="/icons/loading.svg"
                    alt="loading"
                    draggable={false}
                    className="h-[28px] w-[28px] animate-spin invert brightness-200"
                />
                <span className="text-[12px] font-semibold tracking-[0.01em]">{props.label}</span>
            </div>
        </div>
    );
}

const BuilderScreen = dynamic(
    () => import("../screens/builder-screen").then((m) => m.BuilderScreen),
    {
        ssr: false,
        loading: () => <PanelScreenFallback label="Loading" />,
    },
);

const ShopScreen = dynamic(
    () => import("../screens/shop-screen").then((m) => m.ShopScreen),
    {
        ssr: false,
        loading: () => <PanelScreenFallback label="Loading" />,
    },
);

const CommunityScreen = dynamic(
    () => import("../screens/community-screen").then((m) => m.CommunityScreen),
    {
        ssr: false,
        loading: () => <PanelScreenFallback label="Loading" />,
    },
);

const SettingsScreen = dynamic(
    () => import("../screens/settings-screen").then((m) => m.SettingsScreen),
    {
        ssr: false,
        loading: () => <PanelScreenFallback label="Loading" />,
    },
);

export function PanelDynamicScreens(props: {
    displayTab: string;
    filter: VictimsFilter;
    settingsTab: SettingsTabKey;
}) {
    const { displayTab, filter, settingsTab } = props;

    return (
        <>
            {displayTab === "panel" && (
                <div key="panel" className="wc-tab-switch h-full w-full">
                    <PanelScreen filter={filter} />
                </div>
            )}
            {displayTab === "builder" && (
                <div key="builder" className="wc-tab-switch h-full w-full">
                    <BuilderScreen />
                </div>
            )}
            {displayTab === "shop" && (
                <div key="shop" className="wc-tab-switch h-full w-full">
                    <ShopScreen />
                </div>
            )}
            {displayTab === "community" && (
                <div key="community" className="wc-tab-switch h-full w-full">
                    <CommunityScreen />
                </div>
            )}
            {displayTab === "settings" && (
                <div key="settings" className="wc-tab-switch h-full w-full">
                    <SettingsScreen tab={settingsTab} />
                </div>
            )}
        </>
    );
}
