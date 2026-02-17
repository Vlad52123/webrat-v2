import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function normalizeHost(hostHeader: string | null): string {
    return String(hostHeader || "")
        .trim()
        .toLowerCase()
        .replace(/:\d+$/, "");
}

function shouldRedirectToCanonical(host: string): boolean {
    return host === "ru.webcrystal.sbs" || host === "ua.webcrystal.sbs" || host === "kz.webcrystal.sbs";
}

function isBlockedDevice(uaRaw: string): boolean {
    const ua = String(uaRaw || "");
    if (!ua) return false;

    const re =
        /Android|iPhone|iPad|iPod|Windows Phone|Mobile|Tablet|Silk|Kindle|BlackBerry|Opera Mini|IEMobile|Nintendo|PlayStation|Xbox|SmartTV|SMART-TV|TV;|Tizen|Web0S|CrKey|AFTB|AFTS/i;

    return re.test(ua);
}

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sid = req.cookies.get("webrat_session")?.value;

    const host = normalizeHost(req.headers.get("host"));
    if (shouldRedirectToCanonical(host)) {
        const url = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://webcrystal.sbs");
        return NextResponse.redirect(url, 302);
    }

    const ua = req.headers.get("user-agent") || "";
    if (isBlockedDevice(ua)) {
        return new NextResponse("Desktop only", {
            status: 403,
            headers: {
                "content-type": "text/plain; charset=utf-8",
            },
        });
    }

    if (pathname.startsWith("/app") || pathname.startsWith("/panel")) {
        if (!sid) {
            const url = req.nextUrl.clone();
            url.pathname = "/login/";
            url.hash = "";
            return NextResponse.redirect(url, 302);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/|api/|favicon.ico|icons/|logo/|captcha/|fonts/|tg-app/).*)"],
};
