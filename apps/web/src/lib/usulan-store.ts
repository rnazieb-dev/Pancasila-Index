import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";

// Fallback berkas lokal agar usulan tetap tampil ketika DATABASE_URL belum
// aktif di lingkungan lokal / dev (pola mirror write-through, sejalan dengan
// review-state.json). Tidak di-commit (lihat .gitignore).
const FALLBACK_FILE = path.join(process.cwd(), "usulan-fallback.json");

export type UsulanRow = {
  id: string;
  publicId: string;
  institutionId: string;
  termId: string;
  dimensionId: string;
  sourceType: string;
  sourceTitle: string | null;
  sourceUrl: string;
  argumentasi: string;
  nama: string;
  afiliasi: string | null;
  funding: string | null;
  pakta: boolean;
  status: string;
  reviewerNames: string[];
  authorId: string | null;
  authorIdent: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewUsulan = Omit<UsulanRow, "id" | "authorId" | "createdAt" | "updatedAt">;

async function readFallback(): Promise<UsulanRow[]> {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFallback(rows: UsulanRow[]) {
  try {
    await fs.mkdir(path.dirname(FALLBACK_FILE), { recursive: true });
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(rows, null, 2), "utf8");
  } catch (e) {
    console.warn("usulan fallback write skipped:", e);
  }
}

/** Generate publicId bernomor urut, mis. PR-2026-01. */
export async function nextPublicId(existing: UsulanRow[]): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PR-${year}-`;
  const maxSeq = existing.reduce((max, u) => {
    if (u.publicId.startsWith(prefix)) {
      const n = Number(u.publicId.slice(prefix.length).split("-")[0]);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return max;
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

/**
 * Simpan usulan: tulis ke DB bila tersedia, lalu mirror ke fallback JSON.
 * Mengembalikan baris usulan yang tersimpan (persisten).
 */
export async function persistUsulan(
  data: NewUsulan,
  authorId: string | null,
): Promise<UsulanRow> {
  const fallback = await readFallback();
  const publicId = data.publicId || (await nextPublicId(fallback));
  const now = new Date().toISOString();

  const row: UsulanRow = {
    id: "",
    ...data,
    publicId,
    authorId,
    createdAt: now,
    updatedAt: now,
  };

  // Tulis ke PostgreSQL / Prisma bila database aktif.
  let id = "";
  try {
    const created = await db.usulan.create({
      data: {
        publicId,
        institutionId: row.institutionId,
        termId: row.termId,
        dimensionId: row.dimensionId,
        sourceType: row.sourceType,
        sourceTitle: row.sourceTitle,
        sourceUrl: row.sourceUrl,
        argumentasi: row.argumentasi,
        nama: row.nama,
        afiliasi: row.afiliasi,
        funding: row.funding,
        pakta: row.pakta,
        status: row.status as
          | "DRAFT"
          | "PENDING_REVIEW"
          | "PENDING_SECOND"
          | "PUBLISHED"
          | "REJECTED",
        reviewerNames: row.reviewerNames ?? [],
        authorId,
      },
    });
    id = created.id;
  } catch (e) {
    console.warn("usulan DB write skipped:", e);
  }

  // Mirror ke fallback agar tetap terlihat saat DB mati / di dev lokal.
  id = id || `fallback_${now}`;
  row.id = id;
  const merged = [row, ...fallback.filter((u) => u.id !== id)];
  await writeFallback(merged);

  return row;
}

/** Baca usulan milik seorang kontributor (DB dulu, lalu fallback JSON). */
export async function listUsulanBy(authorKey: string, authorId: string | null): Promise<UsulanRow[]> {
  const rows: UsulanRow[] = [];

  if (authorId) {
    try {
      const dbRows = await db.usulan.findMany({
        where: { authorId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      rows.push(...dbRows.map((u) => ({
        id: u.id,
        publicId: u.publicId,
        institutionId: u.institutionId,
        termId: u.termId,
        dimensionId: u.dimensionId,
        sourceType: u.sourceType,
        sourceTitle: u.sourceTitle,
        sourceUrl: u.sourceUrl,
        argumentasi: u.argumentasi,
        nama: u.nama,
        afiliasi: u.afiliasi,
        funding: u.funding,
        pakta: u.pakta,
        status: u.status,
        reviewerNames: u.reviewerNames,
        authorId: u.authorId,
        authorIdent: authorKey,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })));
    } catch {
      // fallback ke JSON
    }
  }

  // Gabungkan dari fallback JSON (hindari duplikasi berdasarkan id).
  const seen = new Set(rows.map((r) => r.id));
  const fallback = await readFallback();
  for (const r of fallback) {
    const matches = r.authorId === authorId || r.authorIdent === authorKey;
    if (matches && !seen.has(r.id)) {
      rows.push(r);
      seen.add(r.id);
    }
  }

  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
