import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["via.placeholder.com"],
  },
};

export default nextConfig;
