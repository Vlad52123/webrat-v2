import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login") {
    if (sid) {
      const url = req.nextUrl.clone();
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|icons/|logo/|captcha/|fonts/).*)"],
};