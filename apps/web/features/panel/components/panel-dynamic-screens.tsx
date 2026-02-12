import dynamic from "next/dynamic";

import { PanelScreen } from "../screens/panel-screen";
import type { VictimsFilter } from "../state/victims-filter";
import type { SettingsTabKey } from "../state/settings-tab";

function PanelScreenFallback(props: { label: string }) {
    return (
        <div className="grid h-full w-full place-items-center">
            <div className="grid place-items-center gap-[12px]">
                <div className="relative grid h-[48px] w-[48px] place-items-center">
                    <div className="absolute inset-0 rounded-full border-[2px] border-[rgba(255,255,255,0.06)]" />
                    <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[rgba(255,255,255,0.30)] animate-spin" />
                    <img
                        src="/logo/main_logo.ico"
                        alt=""
                        draggable={false}
                        className="h-[20px] w-[20px] rounded-[4px] opacity-50"
                        style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                    />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[rgba(255,255,255,0.22)]">{props.label}</span>
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
