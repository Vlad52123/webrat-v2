import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
   trailingSlash: true,
   turbopack: {
      root: path.join(__dirname, "..", ".."),
   },
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

export default nextConfig;