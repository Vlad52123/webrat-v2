import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const analyzeEnabled = process.env.ANALYZE === "true" || process.env.ANALYZE === "1";

const withBundleAnalyzer: (cfg: NextConfig) => NextConfig = (() => {
   if (!analyzeEnabled) return (cfg) => cfg;
   try {
      const ba = require("@next/bundle-analyzer") as unknown as (opts: { enabled: boolean }) => (cfg: NextConfig) => NextConfig;
      return ba({ enabled: true });
   } catch {
      return (cfg) => cfg;
   }
})();

const nextConfig: NextConfig = {
   trailingSlash: true,
   productionBrowserSourceMaps: false,
   compiler: {
      removeConsole: process.env.NODE_ENV === "production",
   },
   turbopack: {},
   async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

      return {
         beforeFiles: [
            { source: "/api/login", destination: `${apiUrl}/login` },
            { source: "/api/me", destination: `${apiUrl}/me` },
            { source: "/api/logout", destination: `${apiUrl}/logout` },
         ],
         afterFiles: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
      };
   },
};

export default withBundleAnalyzer(nextConfig);