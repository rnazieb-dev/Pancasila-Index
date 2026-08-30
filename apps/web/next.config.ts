import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@pancasila-index/core", "@pancasila-index/data"],
  outputFileTracingRoot: monorepoRoot,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "pancasila.site" }],
        destination: "https://www.pancasila.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
