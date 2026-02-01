import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sid = req.cookies.get("webrat_session")?.value;

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
  matcher: ["/app/:path*", "/panel/:path*", "/login"],
};
