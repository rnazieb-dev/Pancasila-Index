import YAML from "yaml";

/**
 * Penyuntingan bedah berkas YAML kanonik.
 *
 * Sengaja berbasis teks, bukan parse-lalu-tulis-ulang. Menulis ulang seluruh
 * dokumen akan memformat ulang 8.616 baris assessments.yaml dan menghasilkan
 * diff raksasa yang mustahil ditelaah manusia — padahal justru telaah manusia
 * yang menjadi jaminan mutu platform ini. Sisipan baris tunggal menghasilkan
 * diff satu baris.
 *
 * Setiap fungsi mengembalikan `applied: false` alih-alih menebak ketika
 * jangkarnya tidak ditemukan. Lebih baik pull request tidak lengkap dan
 * dikatakan apa adanya daripada berkas kanonik rusak diam-diam.
 */

export interface EditResult {
  text: string;
  applied: boolean;
  reason?: string;
}

/** Tambahkan satu entri sumber ke akhir sources.yaml. */
export function appendSource(yamlText: string, entryYaml: string): EditResult {
  const idMatch = entryYaml.match(/^- id:\s*(\S+)/m);
  if (!idMatch) {
    return { text: yamlText, applied: false, reason: "entri sumber tidak memuat id" };
  }
  const id = idMatch[1]!;

  // Idempoten: jangan pernah menduplikasi id sumber.
  if (new RegExp(`^- id:\\s*${escapeRegExp(id)}\\s*$`, "m").test(yamlText)) {
    return { text: yamlText, applied: false, reason: `sumber "${id}" sudah ada` };
  }

  const body = yamlText.replace(/\s*$/, "");
  return { text: `${body}\n${entryYaml.replace(/\s*$/, "")}\n`, applied: true };
}

/**
 * Sisipkan satu sitasi bukti ke dimensi tertentu pada satu masa jabatan.
 *
 * Mencari entri `term_id:` yang tepat lebih dulu, lalu `- dimension_id:` di
 * dalam entri itu saja — id dimensi berulang di seluruh berkas, sehingga
 * pencarian global akan menyunting masa jabatan yang salah.
 */
export function addEvidence(
  yamlText: string,
  termId: string,
  dimensionId: string,
  sourceId: string,
): EditResult {
  const lines = yamlText.split("\n");

  const termLine = lines.findIndex(
    (l) => l.trim() === `term_id: ${termId}`,
  );
  if (termLine === -1) {
    return { text: yamlText, applied: false, reason: `masa jabatan "${termId}" tidak ditemukan` };
  }

  // Batas entri: baris `- id:` berikutnya pada kolom nol.
  let endLine = lines.length;
  for (let i = termLine + 1; i < lines.length; i++) {
    if (/^- /.test(lines[i]!)) {
      endLine = i;
      break;
    }
  }

  const dimLine = lines.findIndex(
    (l, i) =>
      i > termLine && i < endLine && l.trim() === `- dimension_id: ${dimensionId}`,
  );
  if (dimLine === -1) {
    return {
      text: yamlText,
      applied: false,
      reason: `dimensi "${dimensionId}" belum dinilai pada masa jabatan "${termId}"`,
    };
  }

  // Batas dimensi: butir `- dimension_id:` berikutnya, atau akhir entri.
  let dimEnd = endLine;
  for (let i = dimLine + 1; i < endLine; i++) {
    if (/^\s*- dimension_id:/.test(lines[i]!)) {
      dimEnd = i;
      break;
    }
  }

  const evidenceLine = lines.findIndex(
    (l, i) => i > dimLine && i < dimEnd && l.trim() === "evidence:",
  );
  if (evidenceLine === -1) {
    return {
      text: yamlText,
      applied: false,
      reason: `dimensi "${dimensionId}" tidak memiliki blok evidence`,
    };
  }

  // Kumpulkan butir evidence yang sudah ada, sekaligus menentukan indentasinya.
  let insertAt = evidenceLine + 1;
  let indent = " ".repeat((lines[evidenceLine]!.match(/^\s*/)?.[0].length ?? 6) + 2);
  for (let i = evidenceLine + 1; i < dimEnd; i++) {
    const line = lines[i]!;
    if (/^\s*- source_id:/.test(line)) {
      if (line.trim() === `- source_id: ${sourceId}`) {
        return { text: yamlText, applied: false, reason: `sitasi "${sourceId}" sudah ada` };
      }
      indent = line.match(/^\s*/)?.[0] ?? indent;
      insertAt = i + 1;
      continue;
    }
    if (line.trim() === "") continue;
    break;
  }

  lines.splice(insertAt, 0, `${indent}- source_id: ${sourceId}`);
  return { text: lines.join("\n"), applied: true };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Jaring pengaman terakhir sebelum menulis ke repositori kanonik.
 *
 * Berkas yang tidak dapat diurai akan mematahkan `pnpm build:data` dan membuat
 * seluruh situs gagal dibangun. Lebih baik pull request-nya batal daripada
 * berkas kanoniknya rusak.
 */
export function yamlDapatDiurai(text: string): boolean {
  try {
    const parsed = YAML.parse(text);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}
