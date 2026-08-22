import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pancasila-index/core", "@pancasila-index/data"],
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
