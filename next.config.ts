import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  outputFileTracingIncludes: { "/*": ["./data/products.json"] },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
};
export default config;
