"use client";

import Link from "next/link";

import type { PanelTabKey } from "../hooks/use-panel-tab";
import { cn } from "../../../lib/utils";

export function PanelSidebar(props: { tab: PanelTabKey }) {
  const { tab } = props;

  return (
    <aside
      className={cn(
        "grid content-start gap-[2px] border-r border-white/15 bg-black/60 py-2.5 shadow-[8px_0_24px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.02)]",
        "backdrop-blur-md",
      )}
      aria-label="Sidebar"
    >
      <button
        id="detailBackBtn"
        className="hidden"
        type="button"
        aria-label="Back"
      >
        <img
          src="/icons/arrow.svg"
          alt="back"
          className="h-[30px] w-[30px] invert"
          draggable={false}
        />
      </button>

      <Link
        id="logoBtn"
        className="grid place-items-center"
        href="/panel#panel"
        aria-label="Reload"
      >
        <img
          className="h-auto w-[44px] select-none [image-rendering:pixelated]"
          src="/logo/main_logo.ico"
          alt="WebCrystal"
          draggable={false}
        />
      </Link>

      <div className="h-px w-full bg-white/20" aria-hidden="true" />

      <Link
        id="builderBtn"
        className={cn(
          "grid h-[38px] w-full place-items-center rounded-[14px] border border-transparent transition-colors hover:bg-white/5",
          tab === "builder" &&
          "border-white/20 bg-white/10 shadow-[inset_0_-2px_0_rgba(180,180,180,0.45)]",
        )}
        href="/panel#builder"
        aria-label="Builder"
        data-active={tab === "builder"}
      >
        <img
          className="h-7 w-7 opacity-85 invert"
          src="/icons/builder.svg"
          alt="builder"
          draggable={false}
        />
      </Link>

      <Link
        id="shopBtn"
        className="hidden"
        href="/panel#panel"
        aria-label="Shop"
      >
        <img
          className="h-7 w-7 opacity-85 invert"
          src="/icons/shop.svg"
          alt="shop"
          draggable={false}
        />
      </Link>

      <Link
        id="communityBtn"
        className={cn(
          "grid h-[38px] w-full place-items-center rounded-[14px] border border-transparent transition-colors hover:bg-white/5",
          tab === "community" &&
          "border-white/20 bg-white/10 shadow-[inset_0_-2px_0_rgba(180,180,180,0.45)]",
        )}
        href="/panel#community"
        aria-label="Community"
        data-active={tab === "community"}
      >
        <img
          className="h-7 w-7 opacity-85 invert"
          src="/icons/chat.svg"
          alt="community"
          draggable={false}
        />
      </Link>

      <Link
        id="settingsBtn"
        className={cn(
          "grid h-[38px] w-full place-items-center rounded-[14px] border border-transparent transition-colors hover:bg-white/5",
          tab === "settings" &&
          "border-white/20 bg-white/10 shadow-[inset_0_-2px_0_rgba(180,180,180,0.45)]",
        )}
        href="/panel#settings"
        aria-label="Settings"
        data-active={tab === "settings"}
      >
        <img
          className="h-7 w-7 opacity-85 invert"
          src="/icons/settings.svg"
          alt="settings"
          draggable={false}
        />
      </Link>
    </aside>
  );
}
