"use client";

import { LandingNav } from "./landing-page/landing-nav";
import { LandingHero } from "./landing-page/landing-hero";
import { LandingDashboard } from "./landing-page/landing-dashboard";
import { LandingFeatures } from "./landing-page/landing-features";
import { LandingPricing } from "./landing-page/landing-pricing";
import { LandingFooter } from "./landing-page/landing-footer";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(88, 56, 163, 0.22), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(37, 99, 235, 0.08), transparent)",
                }}
            />
            <LandingNav />
            <LandingHero />
            <LandingDashboard />
            <LandingFeatures />
            <LandingPricing />
            <LandingFooter />
        </div>
    );
}