import Link from "next/link";

/* Dummy data kontributor — akan diisi dari DB saat sistem live */
const CONTRIBUTORS = [
  {
    nama: "Prof. Dr. Sri Soemantri Martosoewignjo, S.H.",
    jabatan: "Guru Besar Hukum Tata Negara",
    afiliasi: "Universitas Padjadjaran",
    funding: "Mandiri / Tidak Ada",
    kontribusi: 3,
    status: "Aktif",
    avatar: "SS",
  },
  {
    nama: "Dr. Bivitri Susanti, S.H., LL.M.",
    jabatan: "Peneliti Hukum Konstitusi",
    afiliasi: "Pusat Studi Hukum dan Kebijakan (PSHK)",
    funding: "The Asia Foundation (diungkapkan)",
    kontribusi: 7,
    status: "Aktif",
    avatar: "BS",
  },
  {
    nama: "Feri Amsari, S.H., M.H., LL.M.",
    jabatan: "Direktur Pusat Studi Konstitusi (PUSaKO)",
    afiliasi: "Universitas Andalas",
    funding: "Mandiri / Tidak Ada",
    kontribusi: 5,
    status: "Aktif",
    avatar: "FA",
  },
];

export default function KontributorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/peer-review" className="text-xs text-[var(--muted)] hover:text-white">
        ← Kembali ke Portal Peer Review
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Direktori Kontributor & Pengulas</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Daftar peneliti dan pakar hukum tatanegara yang telah berkontribusi pada Pancasila Index,
            lengkap dengan afiliasi institusi dan deklarasi sumber pendanaan mereka secara terbuka.
          </p>
        </div>
        <Link
          href="/peer-review/usulan"
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition"
        >
          + Ajukan Kontribusi Baru
        </Link>
      </div>

      {/* Prinsip COPE */}
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-xs leading-relaxed text-[var(--muted)]">
        <strong className="text-white">Standar Transparansi:</strong> Pancasila Index mengikuti panduan{" "}
        <strong className="text-sky-400">COPE (Committee on Publication Ethics)</strong> untuk tinjauan
        ilmiah. Seluruh kontributor wajib mendeklarasikan afiliasi, sumber pendanaan, dan potensi
        konflik kepentingan. Informasi ini dipublikasikan terbuka agar pembaca dapat menilai
        independensi setiap kontribusi.
      </div>

      {/* Daftar Kontributor */}
      <div className="mt-8 space-y-4">
        {CONTRIBUTORS.map((c) => (
          <div
            key={c.nama}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 grid sm:grid-cols-[auto_1fr_auto] gap-4 items-start"
          >
            {/* Avatar */}
            <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm shrink-0">
              {c.avatar}
            </div>

            {/* Info */}
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-sm text-white/95">{c.nama}</div>
              <div className="text-xs text-red-400/90">{c.jabatan}</div>
              <div className="text-xs text-[var(--muted)]">{c.afiliasi}</div>
              <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                <span className="text-[var(--muted)]">
                  <span className="font-semibold text-white/70">Funding:</span> {c.funding}
                </span>
              </div>
            </div>

            {/* Statistik */}
            <div className="text-right shrink-0">
              <div className="text-xl font-bold text-white">{c.kontribusi}</div>
              <div className="text-[11px] text-[var(--muted)]">Kontribusi</div>
              <div
                className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold inline-block ${
                  c.status === "Aktif"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {c.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Ingin bergabung sebagai pengulas?{" "}
        <Link href="/peer-review/usulan" className="text-sky-400 hover:text-sky-300">
          Ajukan kontribusi pertama Anda
        </Link>{" "}
        dan nama Anda akan muncul di sini setelah usulan diterima.
      </p>
    </div>
  );
}
