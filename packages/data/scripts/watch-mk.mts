#!/usr/bin/env tsx
/**
 * Pemantau putusan Mahkamah Konstitusi — pengumpan antrean kurasi.
 *
 * TIDAK menilai apa pun. Skrip ini hanya menemukan putusan MK yang BELUM ada di
 * sources.yaml lalu melaporkannya untuk ditinjau manusia. Penilaian otomatis
 * akan menabrak gerbang kurasi proyek ini: status `published` menuntut kuorum
 * dua approver berbeda identitas (lihat packages/data/src/review.ts), dan
 * indeks publik hanya boleh terbentuk dari penilaian yang lolos gerbang itu.
 *
 * Kenapa perlu tangguh terhadap kegagalan: mkri.id berada di balik Cloudflare
 * dan membalas 403 untuk seluruh endpoint dari sebagian jaringan (termasuk
 * mesin pengembang penulis skrip ini, diuji 2026-08-29). Karena itu skrip
 * MEMBEDAKAN "tidak ada putusan baru" dari "sumber tidak terjangkau", dan
 * keluar dengan kode berbeda. Cron yang diam saat sumbernya mati adalah cron
 * yang berbohong.
 *
 * Keluaran: JSON ke stdout, plus ringkasan manusiawi ke stderr.
 * Kode keluar:
 *   0 = berhasil, tidak ada putusan baru
 *   3 = berhasil, ADA putusan baru (cron membuka/memperbarui issue)
 *   4 = sumber tidak terjangkau (cron membuka issue "pemantau buta")
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCES = join(HERE, "..", "data", "sources.yaml");

/** Identitas jujur; jangan menyamar sebagai peramban. */
const UA = "PancasilaIndexBot/0.1 (+https://pancasila.site; pemantau putusan MK)";

const KANDIDAT_URL = [
  "https://www.mkri.id/index.php?page=web.Putusan&menu=5",
  "https://www.mkri.id/index.php?page=web.RekapPutusan&menu=5",
];

/** Nomor putusan pengujian undang-undang, mis. 282/PUU-XXIII/2025. */
const NOMOR_RE = /\b(\d{1,3})\/PUU-([IVX]+)\/(\d{4})\b/g;

interface Temuan {
  nomor: string;
  slug: string;
  url: string;
}

/** id sumber yang dipakai proyek untuk sebuah nomor putusan. */
export function slugPutusan(nomor: string): string {
  return (
    "putusan-mk-" +
    nomor
      .toLowerCase()
      .replace(/\//g, "-")
      .replace(/puu-/, "puu-")
  );
}

function nomorTerdaftar(): Set<string> {
  const teks = readFileSync(SOURCES, "utf8");
  const ids = new Set<string>();
  for (const m of teks.matchAll(/^- id: (putusan-mk-[a-z0-9-]+)$/gm)) ids.add(m[1]!);
  return ids;
}

async function ambil(url: string): Promise<{ ok: boolean; status: number; teks: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(25_000),
    });
    return { ok: res.ok, status: res.status, teks: res.ok ? await res.text() : "" };
  } catch (err) {
    return { ok: false, status: 0, teks: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const terdaftar = nomorTerdaftar();
  const baru = new Map<string, Temuan>();
  const gagal: string[] = [];
  let adaYangTerjangkau = false;

  for (const url of KANDIDAT_URL) {
    const r = await ambil(url);
    if (!r.ok) {
      gagal.push(`${url} -> ${r.status || "koneksi gagal"}`);
      continue;
    }
    adaYangTerjangkau = true;
    for (const m of r.teks.matchAll(NOMOR_RE)) {
      const nomor = m[0];
      const slug = slugPutusan(nomor);
      if (terdaftar.has(slug) || baru.has(slug)) continue;
      baru.set(slug, {
        nomor,
        slug,
        url: `https://www.mkri.id/index.php?page=web.Putusan&id=${nomor}`,
      });
    }
    // jeda kesopanan antar-permintaan, sejalan dengan scrape-jdih.mts
    await new Promise((r) => setTimeout(r, 1500));
  }

  const hasil = {
    dijalankan_pada: new Date().toISOString(),
    sumber_terjangkau: adaYangTerjangkau,
    kegagalan: gagal,
    sudah_terdaftar: terdaftar.size,
    putusan_baru: [...baru.values()],
  };
  process.stdout.write(JSON.stringify(hasil, null, 2) + "\n");

  if (!adaYangTerjangkau) {
    process.stderr.write(
      `PEMANTAU BUTA: tidak satu pun endpoint MK terjangkau.\n` +
        gagal.map((g) => `  - ${g}`).join("\n") +
        `\nIni BUKAN "tidak ada putusan baru". Jangan diperlakukan sebagai aman.\n`
    );
    process.exit(4);
  }

  if (baru.size === 0) {
    process.stderr.write(
      `Tidak ada putusan MK baru di luar ${terdaftar.size} yang sudah terdaftar.\n`
    );
    process.exit(0);
  }

  process.stderr.write(
    `${baru.size} putusan MK belum terdaftar:\n` +
      [...baru.values()].map((t) => `  - ${t.nomor}  ${t.url}`).join("\n") +
      `\n\nLangkah berikutnya bagi kurator: tambahkan ke sources.yaml, buat\n` +
      `peristiwa di data/events/, lalu tautkan sebagai bukti pada dimensi yang\n` +
      `relevan. JANGAN menaikkan skor tanpa keputusan kurator.\n`
  );
  process.exit(3);
}

main().catch((err) => {
  process.stderr.write(`gagal tak terduga: ${err}\n`);
  process.exit(1);
});
