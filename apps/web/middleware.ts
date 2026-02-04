import type { NextRequest } from "next/server";

import { config as proxyConfig, proxy } from "./proxy";

export function middleware(req: NextRequest) {
   return proxy(req);
}

export const config = proxyConfig;