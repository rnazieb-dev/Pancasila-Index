import Link from "next/link";

import { dataset } from "@pancasila-index/data";
import { getCurrentUser, hasRole } from "@/lib/authz";
import { listUsulanForCuration } from "@/lib/usulan-store";
import { buildUsulanPatch } from "@/lib/usulan-patch";
import { githubConfig } from "@/lib/github-pr";
import { UsulanDecision } from "@/components/usulan-decision";

export const dynamic = "force-dynamic";

export const metadata = { title: "Antrean Usulan Bukti" };

const TABS = [
  { key: "PENDING_REVIEW", label: "Menunggu telaah" },
  { key: "PENDING_SECOND", label: "Menunggu penelaah kedua" },
  { key: "PUBLISHED", label: "Siap jadi patch" },
  { key: "REJECTED", label: "Ditolak" },
] as const;

export default async function AntreanUsulanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KURATOR")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">Antrean usulan bukti</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Menelaah usulan kontributor membutuhkan peran Kurator.
        </p>
        <Link href="/kurasi" className="mt-6 inline-block text-sm underline hover:text-[var(--text)]">
          ← kembali ke area kurasi
        </Link>
      </div>
    );
  }

  const params = await searchParams;
  const tab = TABS.find((t) => t.key === params.tab)?.key ?? "PENDING_REVIEW";
  const rows = await listUsulanForCuration(tab);
  const githubAktif = githubConfig() !== null;

  const namaLembaga = (id: string) =>
    dataset.institutions.find((i) => i.id === id)?.name_id ?? id;
  const namaDimensi = (id: string) =>
    dataset.rubric.dimensions.find((d) => d.id === id)?.name_id ?? id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-5">
        <Link href="/kurasi" className="hover:text-[var(--text)] transition">
          Kurasi
        </Link>
        <span>›</span>
        <span className="text-[var(--text)]">Antrean Usulan Bukti</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
        Antrean Usulan Bukti Kontributor
      </h1>

      <div className="mt-4 rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/10 p-4 text-xs leading-relaxed text-[var(--text)]">
        <strong className="text-[var(--acc-amber-strong)]">
          Menyetujui di sini tidak menerbitkan skor.
        </strong>{" "}
        Kanonik penilaian tetap berkas YAML di repositori. Persetujuan dua kurator menandai
        usulan siap dijadikan patch YAML, yang tetap harus masuk lewat Pull Request, ditinjau,
        lalu dibangun ulang. Rantainya: bukti → telaah kurator → patch → PR → build → skor terbit.
        {githubAktif ? (
          <>
            {" "}Pull request dapat dibuka otomatis dari halaman ini, tetapi{" "}
            <strong>penggabungannya tetap memerlukan telaah manusia di repositori.</strong>
          </>
        ) : (
          <>
            {" "}Pembukaan pull request otomatis belum dipasang, sehingga patch perlu disalin
            manual.
          </>
        )}
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/kurasi/usulan?tab=${t.key}`}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "bg-[var(--text)] text-[var(--panel)] border-[var(--text)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted)]">
          Tidak ada usulan pada status ini.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => {
            const patch = buildUsulanPatch(row, new Date(row.createdAt).getFullYear());
            return (
              <li
                key={row.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--acc-amber-strong)]">
                    {row.publicId}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {row.nama}
                    {row.afiliasi ? ` · ${row.afiliasi}` : ""} ·{" "}
                    {new Date(row.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="grid gap-1 text-xs text-[var(--text)] sm:grid-cols-2">
                  <div>
                    <span className="text-[var(--muted)]">Lembaga:</span>{" "}
                    {namaLembaga(row.institutionId)}
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Masa jabatan:</span> {row.termId}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[var(--muted)]">Dimensi:</span>{" "}
                    {namaDimensi(row.dimensionId)}
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-xs leading-relaxed text-[var(--text)]">
                  {row.argumentasi}
                </p>

                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block break-all font-mono text-[11px] text-[var(--acc-sky-strong)] hover:underline"
                >
                  {row.sourceUrl} →
                </a>

                {row.reviewNote && (
                  <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[11px] text-[var(--text)]">
                    <span className="text-[var(--muted)]">Catatan kurator:</span> {row.reviewNote}
                  </div>
                )}

                <div className="text-[11px] text-[var(--muted)]">
                  Telaah: {row.reviewerIds?.length ?? 0}/2
                  {row.reviewerNames?.length ? ` — ${row.reviewerNames.join(", ")}` : ""}
                </div>

                <UsulanDecision
                  publicId={row.publicId}
                  status={row.status}
                  patch={patch}
                  alreadyReviewed={(row.reviewerIds ?? []).includes(user!.id ?? "")}
                  githubAktif={githubAktif}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
