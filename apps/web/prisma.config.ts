import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Konfigurasi Prisma CLI.
 *
 * Menggantikan kunci `package.json#prisma` yang dideprekasi dan akan dihapus
 * pada Prisma 7 - build Vercel sudah memperingatkannya.
 */

/**
 * Sejak Prisma 6, keberadaan berkas konfigurasi ini MEMATIKAN pemuatan berkas
 * `.env` otomatis ("Prisma config detected, skipping environment variable
 * loading"). Akibatnya `prisma db push` gagal dengan
 * "Environment variable not found: DATABASE_URL" meskipun berkas .env-nya ada.
 * Jadi env harus dimuat sendiri di sini.
 *
 * Urutan mengikuti presedensi Next.js: .env.local mengalahkan .env, dan berkas
 * di apps/web mengalahkan berkas di akar repo. `process.loadEnvFile` TIDAK
 * menimpa nilai yang sudah ada di process.env, sehingga yang berprioritas
 * tertinggi harus dimuat LEBIH DULU.
 */
const dirHere = import.meta.dirname ?? process.cwd();
const repoRoot = path.resolve(dirHere, "..", "..");

for (const berkas of [
  path.join(dirHere, ".env.local"),
  path.join(repoRoot, ".env.local"),
  path.join(dirHere, ".env"),
  path.join(repoRoot, ".env"),
]) {
  try {
    process.loadEnvFile(berkas);
  } catch {
    // Berkas tidak ada - wajar; lanjutkan ke kandidat berikutnya.
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
