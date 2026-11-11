import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // the dev "N" badge sat on top of the Home tab
  devIndicators: false,
  // team/league logos come from the Sports API feed
  images: { remotePatterns: [{ protocol: "https", hostname: "static.flashscore.com" }] },
  cacheComponents: true,
  // snapshot mode reads these JSON files at runtime; make sure Vercel ships them
  outputFileTracingIncludes: { "/**": ["./snapshot/**/*"] },
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
