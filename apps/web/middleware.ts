import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { proxy } from "./proxy";

function isBlockedDevice(uaRaw: string): boolean {
  const ua = String(uaRaw || "");
  if (!ua) return false;

  const re =
    /Android|iPhone|iPad|iPod|Windows Phone|Mobile|Tablet|Silk|Kindle|BlackBerry|Opera Mini|IEMobile|Nintendo|PlayStation|Xbox|SmartTV|SMART-TV|TV;|Tizen|Web0S|CrKey|AFTB|AFTS/i;

  return re.test(ua);
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (isBlockedDevice(ua)) {
    return new NextResponse("Desktop only", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return proxy(req);
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|icons/|logo/|captcha/|fonts/).*)"],
};