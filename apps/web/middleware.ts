import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { proxy } from "./proxy";

function normalizeHost(hostHeader: string | null): string {
   return String(hostHeader || "")
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, "");
}

function shouldRedirectToCanonical(host: string): boolean {
   return host === "ru.webcrystal.sbs" || host === "ua.webcrystal.sbs" || host === "kz.webcrystal.sbs";
}

export function middleware(req: NextRequest) {
   const host = normalizeHost(req.headers.get("host"));

   if (shouldRedirectToCanonical(host)) {
      const url = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://webcrystal.sbs");
      return NextResponse.redirect(url, 302);
   }

   return proxy(req);
}

export { config } from "./proxy";
