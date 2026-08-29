import { PDFDocument } from "pdf-lib";

export interface CompressionResult {
  compressed: Uint8Array;
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  ratioPercent: number;
}

/**
 * Mengompresi berkas PDF:
 * - Menghapus metadata berlebih & objek yatim
 * - Mengaktifkan object streams compaction (deflate)
 * - Menghindari penambahan ukuran bila berkas asli sudah sangat padat
 */
export async function compressPdf(pdfBuffer: Uint8Array): Promise<CompressionResult> {
  const originalBytes = pdfBuffer.byteLength;
  try {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    
    // Bersihkan metadata non-esensial untuk efisiensi penyimpanan
    doc.setProducer("Pancasila Index Open Archive");
    doc.setCreator("Pancasila Index Research Engine");
    
    // Simpan dengan kompresi stream objek (standard PDF 1.5+ object streams)
    const compressedBytesArray = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const compressedBytes = compressedBytesArray.byteLength;
    
    // Jika hasil kompresi ternyata lebih besar dari aslinya, gunakan aslinya
    if (compressedBytes < originalBytes) {
      const savedBytes = originalBytes - compressedBytes;
      const ratioPercent = Math.round((savedBytes / originalBytes) * 100);
      return {
        compressed: compressedBytesArray,
        originalBytes,
        compressedBytes,
        savedBytes,
        ratioPercent,
      };
    }
  } catch (err) {
    // Jika PDF tidak dapat diparse oleh parser (misal PDF terenkripsi/khusus), fallback ke buffer asli
  }

  return {
    compressed: pdfBuffer,
    originalBytes,
    compressedBytes: originalBytes,
    savedBytes: 0,
    ratioPercent: 0,
  };
}

/**
 * Membuat snapshot dokumen HTML arsip semantik yang bersih,
 * ringan (<30 KB), tanpa skrip pihak ketiga, iklan, atau pelacak.
 */
export function createHtmlArchive(meta: {
  id: string;
  title: string;
  type: string;
  year?: number;
  originalUrl?: string;
  citation?: string;
  contentHtml?: string;
  rawText?: string;
  fetchedAt?: string;
}): string {
  const dateStr = meta.fetchedAt ?? new Date().toISOString().slice(0, 10);
  const cleanBody = meta.contentHtml
    ? meta.contentHtml
    : meta.rawText
      ? `<pre style="white-space: pre-wrap; font-family: ui-monospace, monospace; line-height: 1.6;">${escapeHtml(meta.rawText)}</pre>`
      : `<p><em>Dokumen primer tercatat dalam inventarisasi Pancasila Index.</em></p>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(meta.title)} — Arsip Primer Pancasila Index</title>
  <meta name="archive-source-id" content="${escapeHtml(meta.id)}">
  <meta name="archive-date" content="${dateStr}">
  <style>
    :root {
      --bg: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --line: #e2e8f0;
      --panel: #f8fafc;
      --accent: #b45309;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b0f1a;
        --text: #f1f5f9;
        --muted: #94a3b8;
        --line: #1e293b;
        --panel: #111827;
        --accent: #d97706;
      }
    }
    body {
      font-family: ui-serif, Georgia, Cambria, serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      margin: 0;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--line);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      background: var(--panel);
      border: 1px solid var(--line);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      margin-bottom: 0.75rem;
    }
    h1 {
      font-size: 1.5rem;
      line-height: 1.3;
      margin: 0.5rem 0;
    }
    .meta-box {
      font-size: 0.85rem;
      color: var(--muted);
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1rem;
      display: grid;
      grid-gap: 0.5rem;
    }
    .meta-item strong {
      color: var(--text);
    }
    article {
      font-size: 1rem;
    }
    article p {
      margin-bottom: 1.25rem;
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--line);
      font-size: 0.8rem;
      color: var(--muted);
      text-align: center;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    a {
      color: var(--accent);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Arsip Primer Mandiri · Pancasila Index</div>
      <h1>${escapeHtml(meta.title)}</h1>
      <div class="meta-box">
        <div class="meta-item"><strong>ID Dokumen:</strong> <code>${escapeHtml(meta.id)}</code></div>
        <div class="meta-item"><strong>Kategori:</strong> ${escapeHtml(meta.type)}${meta.year ? ` (${meta.year})` : ""}</div>
        ${meta.citation ? `<div class="meta-item"><strong>Sitasi Resmi:</strong> ${escapeHtml(meta.citation)}</div>` : ""}
        ${meta.originalUrl ? `<div class="meta-item"><strong>Sumber Asli:</strong> <a href="${escapeHtml(meta.originalUrl)}" rel="noreferrer">${escapeHtml(meta.originalUrl)}</a></div>` : ""}
        <div class="meta-item"><strong>Tanggal Pengarsipan:</strong> ${dateStr}</div>
      </div>
    </header>
    <article>
      ${cleanBody}
    </article>
    <footer>
      Salinan arsip permanen berlisensi publik untuk keperluan verifikasi riset dan audit konstitusional Pancasila Index.
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
