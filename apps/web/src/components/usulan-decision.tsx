"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UsulanPatch } from "@/lib/usulan-patch";

/**
 * Tombol telaah kurator plus tampilan patch YAML.
 *
 * Patch ditampilkan agar langkah dari usulan ke berkas kanonik terlihat dan
 * dapat diperiksa, bukan terjadi diam-diam di basis data.
 */
export function UsulanDecision({
  publicId,
  status,
  patch,
  alreadyReviewed,
  githubAktif,
}: {
  publicId: string;
  status: string;
  patch: UsulanPatch;
  alreadyReviewed: boolean;
  githubAktif: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatch, setShowPatch] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [prCatatan, setPrCatatan] = useState<string[]>([]);

  const final = status === "PUBLISHED" || status === "REJECTED";

  const kirim = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !note.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/kurasi/usulan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, decision, note }),
      });
      if (!res.ok) {
        const pesan = await res
          .json()
          .then((d: { error?: string }) => d?.error)
          .catch(() => null);
        setError(pesan || `Gagal menyimpan telaah (kode ${res.status}).`);
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal menyimpan telaah karena masalah jaringan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-[var(--line)] pt-3">
      {!final && !alreadyReviewed && (
        <>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan telaah (wajib bila menolak)"
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--acc-sky)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => kirim("approve")}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "✓ Setujui"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => kirim("reject")}
              className="flex-1 rounded-lg border border-[var(--acc-red)]/50 py-2 text-xs font-semibold text-[var(--acc-red-strong)] transition hover:bg-[var(--acc-red)]/10 disabled:opacity-60"
            >
              ✕ Tolak
            </button>
          </div>
        </>
      )}

      {alreadyReviewed && !final && (
        <p className="text-[11px] text-[var(--muted)]">
          Anda sudah menelaah usulan ini. Menunggu penelaah kedua yang berbeda.
        </p>
      )}

      {error && (
        <p role="alert" className="text-[11px] text-[var(--acc-red-strong)]">
          {error}
        </p>
      )}

      {status === "PUBLISHED" && githubAktif && !prUrl && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setError(null);
            setBusy(true);
            try {
              const res = await fetch("/api/kurasi/usulan/pr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId }),
              });
              const data = await res.json().catch(() => null);
              if (!res.ok) {
                setError(data?.error || `Gagal membuka PR (kode ${res.status}).`);
                return;
              }
              setPrUrl(data.url);
              setPrCatatan(data.catatan ?? []);
            } catch {
              setError("Gagal membuka PR karena masalah jaringan.");
            } finally {
              setBusy(false);
            }
          }}
          className="w-full rounded-lg bg-[var(--acc-sky)] py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Membuka pull request…" : "⇪ Buka Pull Request otomatis"}
        </button>
      )}

      {prUrl && (
        <div className="space-y-1.5 rounded-lg border border-[var(--acc-emerald)]/40 bg-[var(--acc-emerald)]/10 p-3 text-[11px] text-[var(--text)]">
          <div>
            <strong className="text-[var(--acc-emerald)]">Pull request terbuka.</strong>{" "}
            Skor belum berubah — penelaah PR masih harus menilai apakah bukti ini
            menggesernya.
          </div>
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block break-all font-mono text-[var(--acc-sky-strong)] hover:underline"
          >
            {prUrl} →
          </a>
          {prCatatan.map((c) => (
            <div key={c} className="text-[var(--acc-amber-strong)]">⚠ {c}</div>
          ))}
        </div>
      )}

      {status === "PUBLISHED" && (
        <>
          <button
            type="button"
            onClick={() => setShowPatch((v) => !v)}
            className="w-full rounded-lg border border-[var(--acc-sky)]/50 py-2 text-xs font-semibold text-[var(--acc-sky-strong)] transition hover:bg-[var(--acc-sky)]/10"
          >
            {showPatch
              ? "Sembunyikan patch YAML"
              : githubAktif
                ? "Tampilkan patch YAML (untuk penerapan manual) →"
                : "Tampilkan patch YAML untuk disalin ke PR →"}
          </button>

          {showPatch && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="mb-1 text-[11px] font-semibold text-[var(--muted)]">
                  Tambahkan ke packages/data/data/sources.yaml
                </div>
                <pre className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--text)]">
                  {patch.sourcesYaml}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold text-[var(--muted)]">
                  Lalu pada packages/data/data/assessments.yaml
                </div>
                <pre className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--text)]">
                  {patch.assessmentsHint}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
