import Link from "next/link";
import {
  IconScale,
  IconInstitution,
  IconShieldCheck,
  IconAuditLog,
  IconEdit,
  IconArchive,
  IconFilePlus,
  IconLanguages,
  IconUsers,
} from "@/components/icons";

export default function PeerReviewPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <span className="text-xs uppercase tracking-widest text-[var(--acc-red)] font-semibold">
          Tinjauan Sejawat Terbuka
        </span>
        <h1 className="mt-2 text-3xl font-bold">Portal Peer Review</h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index mengadopsi model <strong className="text-[var(--text)]">tinjauan sejawat terbuka</strong>{" "}
          layaknya jurnal ilmiah. Peneliti, akademisi, dan pakar hukum tatanegara dapat mengusulkan bukti
          primer baru, mengkritisi skor, atau melaporkan koreksi fakta — langsung melalui antarmuka ini,
          tanpa perlu pengetahuan teknis Git/GitHub.
        </p>
      </div>

      {/* Prinsip Transparansi */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: IconScale,
            title: "Kenetralan & Keadilan",
            desc: "Setiap kontributor wajib mendeklarasikan bahwa tidak ada konflik kepentingan personal, politik, atau finansial terhadap lembaga/peristiwa yang dinilai.",
          },
          {
            icon: IconInstitution,
            title: "Transparansi Afiliasi",
            desc: "Nama institusi dan jabatan akademis/profesional kontributor dipublikasikan secara terbuka bersama setiap usulan yang diterima.",
          },
          {
            icon: IconShieldCheck,
            title: "Keterbukaan Funding",
            desc: "Sumber pendanaan riset yang berkaitan wajib diungkapkan. Usulan dari pihak yang memiliki hubungan finansial langsung dengan organ yang dinilai akan ditandai secara khusus.",
          },
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3"
            >
              <div className="p-2 w-fit rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--acc-sky)]">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-sm text-[var(--text)]">{p.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Alur Tinjauan Sejawat */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Alur Kerja Tinjauan Sejawat</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Proses usulan mengikuti standar jurnal ilmiah — transparan, terstruktur, dan berbasis bukti primer.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              step: "1",
              title: "Pengajuan Usulan",
              desc: "Peneliti mengajukan draf usulan berisi bukti primer baru atau koreksi skor dengan landasan normatif yang jelas.",
              icon: IconScale,
            },
            {
              step: "2",
              title: "Verifikasi Otomatis",
              desc: "Pipeline AI mengecek format sitasi, keberadaan tautan dokumen, dan memeriksa kesesuaian rubrik awal.",
              icon: IconShieldCheck,
            },
            {
              step: "3",
              title: "Telaah Dewan Editorial",
              desc: "Minimal 2 penelaah independen (kuorum) memeriksa keabsahan bukti primer sebelum keputusan final.",
              icon: IconInstitution,
            },
            {
              step: "4",
              title: "Publikasi Transparan",
              desc: "Usulan yang disetujui otomatis tercatat dalam Audit Log publik dan tercermin langsung pada indeks.",
              icon: IconAuditLog,
            },
          ].map((step) => (
            <li
              key={step.step}
              className="flex gap-3.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] border border-[var(--line)] text-sm font-mono font-bold text-[var(--acc-red)]">
                {step.step}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{step.title}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA Tools */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Link
          href="/usulkan-bukti"
          className="group rounded-xl border border-red-500/40 bg-red-500/10 p-5 hover:border-red-400 hover:bg-red-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="mb-3 text-[var(--acc-red)]">
              <IconEdit size={22} />
            </div>
            <h3 className="font-bold text-[var(--acc-red-strong)] group-hover:text-[var(--acc-red-strong)]">Ajukan Usulan Baru</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Usulkan bukti primer, perbaiki data peristiwa, atau ajukan revisi skor.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-[var(--acc-red)]">Buka Formulir →</span>
        </Link>

        <Link
          href="/peer-review/import-data"
          className="group rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 hover:border-emerald-400 hover:bg-emerald-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="mb-3 text-emerald-500">
              <IconArchive size={22} />
            </div>
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
              Audit Data Terbuka (CKAN)
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Laboratorium uji kritis data resmi kementerian/lembaga dengan verifikasi Kuorum 2 Reviewer.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Laboratorium Data →</span>
        </Link>

        <Link
          href="/peer-review/draf"
          className="group rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 hover:border-amber-400 hover:bg-amber-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="mb-3 text-amber-500">
              <IconFilePlus size={22} />
            </div>
            <h3 className="font-bold text-[var(--acc-amber-strong)] group-hover:text-[var(--acc-amber-strong)]">Draf Usulan Saya</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Lanjutkan draf bukti dan argumentasi yang tersimpan otomatis di peramban.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-[var(--acc-amber)]">Kelola Draf Lokal →</span>
        </Link>

        <Link
          href="/peer-review/terjemahan"
          className="group rounded-xl border border-sky-500/40 bg-sky-500/10 p-5 hover:border-sky-400 hover:bg-sky-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="mb-3 text-sky-500">
              <IconLanguages size={22} />
            </div>
            <h3 className="font-bold text-[var(--acc-sky-strong)] group-hover:text-[var(--acc-sky-strong)]">Tinjauan Terjemahan</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Koreksi dan validasi terjemahan substantif dalam 4 bahasa (EN, Jawa, Sunda, Minang).
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-[var(--acc-sky)]">Antrean Bahasa →</span>
        </Link>

        <Link
          href="/peer-review/kontributor"
          className="group rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 hover:border-slate-500 transition flex flex-col justify-between"
        >
          <div>
            <div className="mb-3 text-[var(--muted)]">
              <IconUsers size={22} />
            </div>
            <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--text)]">Direktori Kontributor</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Lihat daftar terbuka seluruh peneliti beserta afiliasi dan deklarasi transparansi.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-[var(--muted)]">Lihat Profil →</span>
        </Link>
      </section>

      {/* Catatan Dewan Editorial sementara */}
      <div className="mt-10 rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 text-xs leading-relaxed text-[var(--acc-amber-strong)]">
        <strong className="text-[var(--acc-amber-strong)]">Catatan:</strong> Platform Peer Review saat ini dalam fase
        pengembangan aktif. Formulir submisi dan antrean Dewan Editorial akan sepenuhnya fungsional pada
        rilis v1.0. Untuk sementara, usulan dapat dikirimkan melalui formulir di bawah sebagai draf
        awal yang akan ditinjau tim inti.
      </div>
    </div>
  );
}
