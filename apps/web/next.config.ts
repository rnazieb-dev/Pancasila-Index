import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

/**
 * Akar penelusuran berkas untuk paket lambda.
 *
 * WAJIB akar monorepo, bukan process.cwd(). Build dijalankan lewat
 * `pnpm --filter @pancasila-index/web build`, sehingga process.cwd() adalah
 * apps/web. Dengan akar di situ, penelusuran tidak dapat menjangkau
 * node_modules/.pnpm di akar workspace -- tempat `next` sesungguhnya berada --
 * jadi berkas seperti next/dist/compiled/source-map terbuang dari lambda.
 *
 * Akibatnya di produksi: SETIAP serverless function mati saat cold start
 * dengan "Cannot find module 'next/dist/compiled/source-map'", sehingga
 * seluruh REST API balas 500 sementara halaman tetap 200 karena diprerender.
 * Gejalanya menyesatkan: situs tampak hidup, hanya API-nya yang mati total.
 */
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@pancasila-index/core", "@pancasila-index/data"],
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
