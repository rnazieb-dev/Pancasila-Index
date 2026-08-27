"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import {
  getUserDrafts,
  deleteUserDraft,
  duplicateUserDraft,
  saveUserDraft,
  type UserDraft,
} from "@/lib/user-drafts";

export default function UserDraftsPage() {
  const [drafts, setDrafts] = useState<UserDraft[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = () => {
    setDrafts(getUserDrafts());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus draf "${title}"?`)) {
      deleteUserDraft(id);
      refresh();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateUserDraft(id);
    refresh();
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(drafts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pancasila-index-drafts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            saveUserDraft(item);
          }
          refresh();
          alert(`Berhasil mengimpor ${imported.length} draf.`);
        }
      } catch {
        alert("Format berkas JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  const institutionsById = new Map(dataset.institutions.map((i) => [i.id, i]));
  const dimensionsById = new Map(dataset.rubric.dimensions.map((d) => [d.id, d]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/peer-review" className="text-xs text-[var(--muted)] hover:text-white">
        ← Kembali ke Portal Peer Review
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
            Penyimpanan Lokal Pengguna
          </span>
          <h1 className="mt-1 text-3xl font-bold">Draf Usulan Saya (User Drafts)</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Seluruh draf penilaian, bukti primer, dan argumentasi yang sedang Anda susun tersimpan aman di peramban ini.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/peer-review/usulan"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
          >
            + Buat Draf Baru
          </Link>
          {drafts.length > 0 && (
            <button
              onClick={handleExportJson}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-white hover:border-slate-500 transition"
            >
              📥 Cadangkan JSON
            </button>
          )}
          <label className="cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-white hover:border-slate-500 transition">
            📤 Impor JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Daftar Draf */}
      {drafts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-lg font-bold text-white/90">Belum Ada Draf Tersimpan</h2>
          <p className="mt-2 text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Saat Anda mengisi formulir usulan bukti atau koreksi penilaian di portal Peer Review, Anda dapat menyimpannya sewaktu-waktu tanpa khawatir kehilangan data.
          </p>
          <Link
            href="/peer-review/usulan"
            className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition"
          >
            Mulai Tulis Usulan Pertama →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Menampilkan {drafts.length} draf aktif</span>
            <span>Tersimpan otomatis di peramban</span>
          </div>

          <div className="grid gap-4">
            {drafts.map((d) => {
              const inst = institutionsById.get(d.institution_id);
              const dim = dimensionsById.get(d.dimension_id);

              // Hitung kelengkapan draf
              const fields = [
                d.institution_id,
                d.term_id,
                d.dimension_id,
                d.source_type,
                d.source_title,
                d.source_url,
                d.argumentasi,
                d.nama,
                d.afiliasi,
                d.funding,
                d.setuju_pakta,
              ];
              const completedFields = fields.filter(Boolean).length;
              const pct = Math.round((completedFields / fields.length) * 100);

              const formattedDate = new Date(d.updatedAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3 hover:border-slate-500 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="rounded bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5">
                          DRAF LOKAL
                        </span>
                        {inst && (
                          <span className="rounded bg-slate-800 text-slate-300 font-medium px-2 py-0.5">
                            {inst.name_id}
                          </span>
                        )}
                        {dim && (
                          <span className="text-[var(--muted)]">
                            • {dim.name_id}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-white/95 mt-1">
                        {d.source_title || d.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">
                        {pct}% Lengkap
                      </span>
                      <div className="text-[10px] text-[var(--muted)]">
                        Diperbarui: {formattedDate}
                      </div>
                    </div>
                  </div>

                  {/* Snippet Argumentasi */}
                  {d.argumentasi && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed bg-[var(--bg)] p-2.5 rounded-lg border border-[var(--line)]">
                      &ldquo;{d.argumentasi}&rdquo;
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/peer-review/usulan?draftId=${d.id}`}
                        className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition"
                      >
                        ✏️ Lanjutkan Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(d.id)}
                        className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-white hover:border-slate-500 transition"
                      >
                        📋 Duplikasi
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(d, null, 2));
                          setCopiedId(d.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-white hover:border-slate-500 transition"
                      >
                        {copiedId === d.id ? "✓ Tersalin" : "Salin JSON"}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(d.id, d.source_title || d.title)}
                      className="text-xs text-red-400/80 hover:text-red-300 transition"
                    >
                      🗑️ Hapus Draf
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
