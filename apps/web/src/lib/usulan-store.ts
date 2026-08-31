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
  reviewerIds: string[];
  reviewNote: string | null;
  authorId: string | null;
  authorIdent: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewUsulan = Omit<
  UsulanRow,
  "id" | "authorId" | "createdAt" | "updatedAt" | "reviewerIds" | "reviewNote"
> &
  Partial<Pick<UsulanRow, "reviewerIds" | "reviewNote">>;

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
    reviewerIds: data.reviewerIds ?? [],
    reviewNote: data.reviewNote ?? null,
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
        reviewerIds: row.reviewerIds ?? [],
        reviewNote: row.reviewNote ?? null,
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
        reviewerIds: u.reviewerIds,
        reviewNote: u.reviewNote,
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

/**
 * Baca antrean usulan untuk kurator (DB dulu, lalu fallback JSON).
 *
 * Sebelumnya tidak ada satu pun pembaca antrean ini. Usulan kontributor masuk
 * berstatus PENDING_REVIEW dan berhenti selamanya karena tak ada permukaan
 * yang menampilkannya.
 */
export async function listUsulanForCuration(
  status?: string,
): Promise<UsulanRow[]> {
  const rows: UsulanRow[] = [];

  try {
    const dbRows = await db.usulan.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    rows.push(
      ...dbRows.map((u) => ({
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
        reviewerIds: u.reviewerIds,
        reviewNote: u.reviewNote,
        authorId: u.authorId,
        authorIdent: null,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    );
  } catch {
    // fallback ke JSON
  }

  const seen = new Set(rows.map((r) => r.id));
  for (const r of await readFallback()) {
    if (seen.has(r.id)) continue;
    if (status && r.status !== status) continue;
    rows.push(r);
    seen.add(r.id);
  }

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUsulanByPublicId(publicId: string): Promise<UsulanRow | null> {
  const all = await listUsulanForCuration();
  return all.find((u) => u.publicId === publicId) ?? null;
}

/**
 * Catat satu keputusan kurator dan hitung ulang statusnya.
 *
 * Kuorum ditentukan `reviewerIds` (User.id), BUKAN nama tampilan — nama dapat
 * diubah pemiliknya sehingga satu akun bisa lolos sebagai dua penelaah.
 *
 * PENTING: status PUBLISHED di sini berarti "disetujui untuk dijadikan patch
 * YAML", BUKAN "skor sudah terbit". Skor hanya menjadi nyata setelah patch-nya
 * masuk ke git dan lolos build. Basis data tetap lapisan overlay.
 */
export async function recordUsulanDecision(params: {
  publicId: string;
  decision: "approve" | "reject";
  reviewerId: string;
  reviewerName: string;
  note?: string;
}): Promise<
  | { ok: true; row: UsulanRow }
  | { ok: false; reason: "not-found" | "already-reviewed" | "final" }
> {
  const row = await getUsulanByPublicId(params.publicId);
  if (!row) return { ok: false, reason: "not-found" };
  if (row.status === "PUBLISHED" || row.status === "REJECTED") {
    return { ok: false, reason: "final" };
  }

  const reviewerIds = row.reviewerIds ?? [];
  if (reviewerIds.includes(params.reviewerId)) {
    return { ok: false, reason: "already-reviewed" };
  }

  let nextStatus: UsulanRow["status"];
  let nextIds = reviewerIds;
  let nextNames = row.reviewerNames ?? [];

  if (params.decision === "reject") {
    // Penolakan bersifat final dan wajib beralasan; alasannya ikut tercatat
    // agar pengusul tahu mengapa, bukan sekadar melihat status berubah.
    nextStatus = "REJECTED";
    nextIds = [...reviewerIds, params.reviewerId];
    nextNames = [...nextNames, params.reviewerName];
  } else {
    nextIds = [...reviewerIds, params.reviewerId];
    nextNames = [...nextNames, params.reviewerName];
    nextStatus = nextIds.length >= 2 ? "PUBLISHED" : "PENDING_SECOND";
  }

  const updated: UsulanRow = {
    ...row,
    status: nextStatus,
    reviewerIds: nextIds,
    reviewerNames: nextNames,
    reviewNote: params.note?.trim() || row.reviewNote,
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.usulan.update({
      where: { publicId: params.publicId },
      data: {
        status: nextStatus as never,
        reviewerIds: nextIds,
        reviewerNames: nextNames,
        reviewNote: updated.reviewNote,
      },
    });
  } catch (e) {
    console.warn("usulan decision DB write skipped:", e);
  }

  const fallback = await readFallback();
  await writeFallback([updated, ...fallback.filter((u) => u.id !== updated.id)]);

  return { ok: true, row: updated };
}
