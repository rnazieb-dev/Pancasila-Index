/**
 * Manajemen User Drafts (Draf Pengguna) untuk Peer Review & Usulan Bukti.
 * Tersimpan persisten di LocalStorage pengguna, aman dari hilang data saat mengetik argumentasi panjang.
 */

export interface UserDraft {
  id: string;
  title: string;
  institution_id: string;
  term_id: string;
  dimension_id: string;
  source_type: string;
  source_title: string;
  source_url: string;
  argumentasi: string;
  nama: string;
  afiliasi: string;
  jabatan: string;
  funding: string;
  setuju_pakta: boolean;
  step: "form" | "deklarasi" | "konfirmasi";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "pancasila_index_user_drafts_v1";

export function getUserDrafts(): UserDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getUserDraft(id: string): UserDraft | null {
  const drafts = getUserDrafts();
  return drafts.find((d) => d.id === id) ?? null;
}

export function saveUserDraft(draft: Partial<UserDraft> & { id?: string }): UserDraft {
  const drafts = getUserDrafts();
  const now = new Date().toISOString();

  let id = draft.id;
  if (!id) {
    id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  const title =
    draft.source_title?.trim() ||
    draft.argumentasi?.slice(0, 35).trim() ||
    "Draf Usulan Tanpa Judul";

  const existingIndex = drafts.findIndex((d) => d.id === id);

  const fullDraft: UserDraft = {
    id,
    title,
    institution_id: draft.institution_id || "",
    term_id: draft.term_id || "",
    dimension_id: draft.dimension_id || "",
    source_type: draft.source_type || "",
    source_title: draft.source_title || "",
    source_url: draft.source_url || "",
    argumentasi: draft.argumentasi || "",
    nama: draft.nama || "",
    afiliasi: draft.afiliasi || "",
    jabatan: draft.jabatan || "",
    funding: draft.funding || "",
    setuju_pakta: draft.setuju_pakta ?? false,
    step: draft.step || "form",
    createdAt: existingIndex >= 0 ? drafts[existingIndex]!.createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    drafts[existingIndex] = fullDraft;
  } else {
    drafts.unshift(fullDraft);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error("Gagal menyimpan draf:", err);
  }

  return fullDraft;
}

export function deleteUserDraft(id: string): void {
  const drafts = getUserDrafts().filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error("Gagal menghapus draf:", err);
  }
}

export function duplicateUserDraft(id: string): UserDraft | null {
  const source = getUserDraft(id);
  if (!source) return null;

  return saveUserDraft({
    ...source,
    id: undefined,
    title: `${source.title} (Salinan)`,
  });
}
