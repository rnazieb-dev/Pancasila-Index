import fs from "node:fs";
import { stringify } from "yaml";

const SP = process.env.SP;
const DATA = new URL("../data/", import.meta.url).pathname;
const S = JSON.parse(fs.readFileSync(`${SP}/panen/sumber_baru.json`, "utf8"));
const P = JSON.parse(fs.readFileSync(`${SP}/panen/peristiwa_baru.json`, "utf8"));

const opsi = { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" };

// --- sumber: tambahkan ke sources.yaml ---
const lamaSumber = fs.readFileSync(`${DATA}sources.yaml`, "utf8").replace(/\s*$/, "");
const blokSumber = stringify(S, opsi).replace(/\s*$/, "");
fs.writeFileSync(
  `${DATA}sources.yaml`,
  `${lamaSumber}\n# --- Register JDIH (peraturan.bpk.go.id) -------------------------------\n` +
  `# Dipanen langsung dari basis data hukum resmi negara. Setiap entri membawa\n` +
  `# sitasi Lembaran Negara dan tautan PDF resmi. provenance: register-jdih\n` +
  `# menandai bahwa ini rekaman register, bukan sumber yang dikurasi.\n${blokSumber}\n`
);

// --- peristiwa: file terpisah per era ---
const era = (t) => {
  const y = parseInt(String(t).slice(0, 4), 10);
  if (y < 1959) return "1945-1959";
  if (y < 1966) return "1959-1966";
  if (y < 1998) return "1966-1998";
  if (y < 2004) return "1998-2004";
  if (y < 2014) return "2004-2014";
  if (y < 2024) return "2014-2024";
  return "2024-sekarang";
};
// Bila peristiwa terkurasi sudah mencakup dokumen yang sama (judul senormal
// pagar duplikat, masa jabatan & tanggal sama), entri register DIBUANG.
// Kurasi selalu menang: ia membawa analisis, register hanya metadata.
const inti = (t) =>
  t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
   .filter((w) => w.length > 3 || /^\d+$/.test(w)).sort().join(" ");
const ds = JSON.parse(fs.readFileSync("packages/data/generated/dataset.json", "utf8"));
const kunciLama = new Set(ds.events.map((e) => `${e.term_id}::${e.date}::${inti(e.title_id)}`));
const sebelum = P.length;
const Pfilter = P.filter((p) => !kunciLama.has(`${p.term_id}::${p.date}::${inti(p.title_id)}`));
console.log(`  duplikat dengan peristiwa terkurasi dibuang: ${sebelum - Pfilter.length}`);
const idDipakai = new Set(Pfilter.map((p) => p.source_ids[0]));

const bucket = {};
for (const p of Pfilter) (bucket[era(p.date)] ??= []).push(p);
let n = 0;
for (const [k, arr] of Object.entries(bucket)) {
  arr.sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.id.localeCompare(b.id));
  fs.writeFileSync(
    `${DATA}events/register-jdih-${k}.yaml`,
    `# Register peraturan JDIH ${k} - dipanen dari peraturan.bpk.go.id.\n` +
    `# Isi ringkasan adalah metadata Lembaran Negara apa adanya (tanggal,\n` +
    `# nomor LN/TLN, jumlah halaman, status berlaku) - BUKAN analisis.\n` +
    `# Build menolak entri ini dipakai sebagai bukti skor dimensi (guard 5c).\n` +
    stringify(arr, opsi)
  );
  n += arr.length;
  console.log(`  register-jdih-${k}.yaml: ${arr.length}`);
}
console.log(`sumber +${S.length} | peristiwa +${n}`);
