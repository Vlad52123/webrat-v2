import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const appFont = localFont({
  src: "../public/fonts/fonts.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const appFontMono = localFont({
  src: "../public/fonts/fonts.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WebCrystal",
  description: "WebCrystal",
  icons: {
    icon: "/logo/main_logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${appFont.variable} ${appFontMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}