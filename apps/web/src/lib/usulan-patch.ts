import type { UsulanRow } from "@/lib/usulan-store";

/**
 * Menerjemahkan usulan bukti yang telah lolos kuorum menjadi potongan YAML
 * kanonik yang siap ditempel ke repositori.
 *
 * MENGAPA BEGINI, BUKAN TULIS LANGSUNG KE BASIS DATA:
 *
 * Kanonik untuk penilaian adalah YAML di git — dinyatakan di kepala
 * prisma/schema.prisma dan di CONTRIBUTING.md. Basis data hanya lapisan
 * overlay. Jika web ikut menyimpan skor, akan ada dua sumber kebenaran yang
 * cepat atau lambat berbeda, dan angka yang terbit tidak lagi dapat
 * direplikasi dari repositori publik — padahal itulah janji utama platform ini.
 *
 * Karena itu keputusan kurator di web tidak menerbitkan skor. Ia menghasilkan
 * patch yang harus masuk lewat PR, ditinjau, lalu dibangun ulang. Rantainya
 * tetap: bukti → telaah kurator → patch → PR → build → skor terbit.
 */

/** Ubah judul bebas menjadi slug id yang stabil untuk sources.yaml. */
export function slugifySourceId(input: string, fallback: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || fallback;
}

/** Kutip nilai YAML hanya bila perlu, dan lipat baris panjang dengan aman. */
function yamlString(value: string): string {
  const oneLine = value.replace(/\s+/g, " ").trim();
  if (!oneLine) return '""';
  // Blok literal untuk teks panjang / mengandung karakter yang menyulitkan.
  if (oneLine.length > 70 || /[:#\-?{}[\],&*!|>'"%@`]/.test(oneLine[0]!) || oneLine.includes(": ")) {
    return `>-\n${oneLine.replace(/(.{1,68})(\s|$)/g, "        $1\n").trimEnd()}`;
  }
  return oneLine;
}

export interface UsulanPatch {
  sourceId: string;
  sourcesYaml: string;
  assessmentsHint: string;
  ringkasan: string;
}

export function buildUsulanPatch(row: UsulanRow, year: number): UsulanPatch {
  const sourceId = slugifySourceId(
    row.sourceTitle || row.publicId,
    row.publicId.toLowerCase(),
  );

  const sourcesYaml = [
    `- id: ${sourceId}`,
    `  type: ${row.sourceType}`,
    `  title_id: ${yamlString(row.sourceTitle || "(judul belum diisi pengusul)")}`,
    `  year: ${year}`,
    `  citation_id: ${yamlString(row.sourceTitle || row.publicId)}`,
    `  url: ${row.sourceUrl}`,
  ].join("\n");

  const assessmentsHint = [
    `# Pada assessments.yaml, di entri term_id: ${row.termId},`,
    `# di bawah dimension_id: ${row.dimensionId},`,
    `# tambahkan sitasi berikut ke daftar evidence:`,
    `      evidence:`,
    `        - source_id: ${sourceId}`,
    `#`,
    `# Skornya TIDAK otomatis berubah. Kurator menilai apakah bukti ini`,
    `# menggeser skor dimensi tersebut, lalu menyesuaikan score/confidence/`,
    `# rationale_id pada PR yang sama.`,
  ].join("\n");

  const ringkasan =
    `Usulan ${row.publicId} — ${row.nama}` +
    (row.afiliasi ? ` (${row.afiliasi})` : "") +
    `\nLembaga: ${row.institutionId} · Masa jabatan: ${row.termId}` +
    `\nDimensi: ${row.dimensionId}` +
    `\nSumber: ${row.sourceUrl}` +
    `\n\nArgumentasi pengusul:\n${row.argumentasi}`;

  return { sourceId, sourcesYaml, assessmentsHint, ringkasan };
}
