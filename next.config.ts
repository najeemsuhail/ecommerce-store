import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["via.placeholder.com", "cdn.shopify.com"],
  },
};

export default nextConfig;
