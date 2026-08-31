import Link from "next/link";
import {
  IconScale,
  IconInstitution,
  IconShieldCheck,
  IconAuditLog,
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

      {/* Alur Review */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Alur Tinjauan Sejawat</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Proses usulan mengikuti standar jurnal ilmiah — transparan, terstruktur, dan berdasarkan bukti.
        </p>
        <ol className="mt-6 space-y-4">
          {[
            { n: "1", title: "Submisi Usulan", desc: "Kontributor mengisi formulir web: pilih organ & periode, lampirkan bukti empiris (Dokumen Negara/Jurnal Akademik/Berita Kredibel), tulis argumentasi normatif, dan tanda tangani Pakta Integritas." },
            { n: "2", title: "Verifikasi Awal (Otomatis)", desc: "Sistem memvalidasi: URL sumber primer dapat diakses, format data sesuai rubrik, dan deklarasi transparansi terisi lengkap." },
            { n: "3", title: "Under Review — Kontributor Terkurasi", desc: "Usulan yang lolos verifikasi awal masuk ke antrean (≥2 kontributor independen). Proses tinjauan dilakukan oleh praktisi dan akademisi sesuai dengan kapasitas keilmuannya (misal: isu konstitusional diulas oleh pakar hukum tata negara)." },
            { n: "4", title: "Diterima / Ditolak", desc: "Putusan tim kontributor disertai alasan yang tercatat publik. Usulan yang diterima diintegrasikan ke dataset kanonik. Usulan yang ditolak beserta alasannya tetap dapat diakses untuk transparansi." },
          ].map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-[var(--acc-red)]">
                {step.n}
              </span>
              <div>
                <div className="font-semibold text-sm text-[var(--text)]">{step.title}</div>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/usulkan-bukti"
          className="group rounded-xl border border-red-500/40 bg-red-500/10 p-5 hover:border-red-400 hover:bg-red-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl mb-2.5">📝</div>
            <h3 className="font-bold text-[var(--acc-red-strong)] group-hover:text-[var(--acc-red-strong)]">Ajukan Usulan Baru</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Usulkan bukti primer, perbaiki data peristiwa, atau ajukan revisi skor.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-[var(--acc-red)]">Buka Formulir →</span>
        </Link>

        <Link
          href="/peer-review/draf"
          className="group rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 hover:border-amber-400 hover:bg-amber-500/20 transition flex flex-col justify-between"
        >
          <div>
            <div className="text-2xl mb-2.5">📁</div>
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
            <div className="text-2xl mb-2.5">🌐</div>
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
            <div className="text-2xl mb-2.5">👥</div>
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
