import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // the dev "N" badge sat on top of the Home tab
  devIndicators: false,
  // team/league logos come from the Sports API feed
  images: { remotePatterns: [{ protocol: "https", hostname: "static.flashscore.com" }] },
  cacheComponents: true,
  // browser → same origin → backend (see lib/config.ts): REST, and Socket.IO polling on /sio
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4247";
    return [
      { source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` },
      { source: "/sio", destination: `${backend}/socket.io/` },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
