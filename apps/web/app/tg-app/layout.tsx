import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
    title: "WebCrystal",
    description: "WebCrystal Telegram Mini App",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#07060b",
};

export default function TgAppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
            {children}
        </>
    );
}
