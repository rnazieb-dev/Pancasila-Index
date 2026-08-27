import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Konfigurasi Prisma CLI.
 *
 * Menggantikan kunci `package.json#prisma` yang dideprekasi dan akan dihapus
 * pada Prisma 7 - build Vercel sudah memperingatkannya.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
