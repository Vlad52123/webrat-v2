import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
         <body className="antialiased">
            <Providers>{children}</Providers>
            <div
               className="wc-bottom-line pointer-events-none fixed bottom-0 left-0 right-0 z-[60] h-[3px] opacity-0"
               style={{ background: "var(--line)", boxShadow: "0 0 10px rgba(0, 0, 0, 0.75)" }}
               aria-hidden="true"
            />
         </body>
      </html>
   );
}