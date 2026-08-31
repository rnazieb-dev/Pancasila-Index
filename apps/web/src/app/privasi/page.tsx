import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi dan pelindungan data pribadi Pancasila Index sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
};

export default function PrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Kebijakan Privasi</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text)]">Kebijakan Privasi &amp; Pelindungan Data Pribadi</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Dokumen ini menjelaskan bagaimana Pancasila Index memproses data pribadi Anda sesuai
          <strong className="text-[var(--text)]"> Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
          Terakhir diperbarui: 30 Agustus 2026.
        </p>
      </header>

      {[
        {
          n: "1",
          t: "Identitas Pengendali Data",
          body: (
            <>
              Pancasila Index adalah platform penilaian independen kesetiaan 8 organ konstitusional Indonesia
              terhadap Pancasila dan UUD 1945. Sebagai pengendali data pribadi, kami dapat dihubungi melalui
              <strong className="text-[var(--text)]"> tim@pancasila.site</strong> (petugas pelindungan data / DPO).
              Situs ini dioperasikan melalui infrastruktur komputasi awan berstandar keamanan tinggi dan autentikasi resmi GitHub (GitHub, Inc.).
            </>
          ),
        },
        {
          n: "2",
          t: "Data Pribadi yang Kami Proses",
          body: (
            <>
              Kami memproses data yang Anda berikan: <strong className="text-[var(--text)]">nama, alamat email, foto
              profil, nama pengguna GitHub, afiliasi institusi, jabatan/gelar, deklarasi pendanaan, dan biografi</strong>,
              serta kredensial akses (sandi disimpan dalam bentuk hash, tidak pernah tersimpan sebagai teks terbuka).
              Untuk keamanan dan pencegahan penyalahgunaan, kami juga memproses data log (alamat IP) secara
              sementara di memori dan catatan audit aktivitas akun.
            </>
          ),
        },
        {
          n: "3",
          t: "Dasar Hukum Pemrosesan (Pasal 20)",
          body: (
            <>
              Pemrosesan data dilakukan atas dasar: (a) persetujuan yang sah dari Anda untuk ikut serta sebagai
              kontributor; (b) pelaksanaan perjanjian/kontrak penyediaan layanan platform; (c) kepentingan yang sah
              untuk keamanan, integritas ilmiah, dan pencegahan penyalahgunaan; serta (d) pemenuhan kewajiban hukum.
              Deklarasi afiliasi dan pendanaan dipublikasikan sebagai bagian standar transparansi integritas riset
              (COPE) atas persetujuan Anda.
            </>
          ),
        },
        {
          n: "4",
          t: "Tujuan Pemrosesan",
          body: (
            <>
              Data digunakan untuk: mengelola akun dan sesi; memfasilitasi kurasi dan telaah sejawat; menampilkan
              transparansi afiliasi/pendanaan pada kontribusi; mencegah penyalahgunaan; serta keperluan audit dan
              pemenuhan hukum. Kami <strong className="text-[var(--text)]">tidak</strong> menjual data pribadi Anda.
            </>
          ),
        },
        {
          n: "5",
          t: "Masa Retensi",
          body: (
            <>
              Data pribadi disimpan selama akun aktif atau selama diperlukan untuk tujuan di atas, dan dihapus atau
              dianonimkan bila tidak lagi diperlukan, kecuali wajib disimpan berdasarkan ketentuan peraturan
              perundang-undangan. Anda dapat menghapus data kapan pun (lihat Hak Subjek Data).
            </>
          ),
        },
        {
          n: "6",
          t: "Hak Subjek Data (Pasal 5–13)",
          body: (
            <>
              Anda berhak untuk: <strong className="text-[var(--text)]">mengakses</strong>,{" "}
              <strong className="text-[var(--text)]">mengoreksi</strong> (halaman Pengaturan → Profil),{" "}
              <strong className="text-[var(--text)]">mengekspor</strong> (halaman Pengaturan → Ekspor Data),{" "}
              <strong className="text-[var(--text)]">menghapus/menarik persetujuan</strong> (halaman Pengaturan →
              Hapus Akun), serta membatasi pemrosesan data Anda. Ajukan permohonan melalui{" "}
              <strong className="text-[var(--text)]">tim@pancasila.site</strong>.
            </>
          ),
        },
        {
          n: "7",
          t: "Kuki, Penyimpanan Lokal &amp; Analitik",
          body: (
            <>
              Kami menggunakan kuki sesi (diperlukan agar Anda tetap masuk) dan penyimpanan lokal peramban untuk
              preferensi tema/bahasa serta draf usulan Anda (tersimpan di perangkat Anda sendiri). Kami juga
              menggunakan analitik anonim (Vercel Analytics) untuk mengukur penggunaan — hanya aktif setelah Anda
              memberikan persetujuan melalui banner persetujuan kuki. Anda dapat menarik persetujuan kapan pun.
            </>
          ),
        },
        {
          n: "8",
          t: "Transfer Data Lintas Batas Negara (Pasal 56)",
          body: (
            <>
              Data diproses pada penyedia layanan komputasi awan global berstandar keamanan internasional.
              Penyedia layanan tersebut memiliki tingkat pelindungan data yang memadai dan menerapkan
              pengamanan kontraktual yang ketat. Dengan menggunakan platform ini, Anda menyetujui pemrosesan tersebut.
            </>
          ),
        },
        {
          n: "9",
          t: "Keamanan Data (Pasal 35–38)",
          body: (
            <>
              Kami menerapkan langkah pengamanan teknis dan organisasional, termasuk enkripsi sandi (hash),
              pembatasan akses berlapis, dan pembatasan frekuensi (rate limiting). Bila terjadi kegagalan pelindungan
              data pribadi, kami akan memberitahukan kepada Anda dan lembaga pengawas selambat-lambatnya 3×24 jam.
            </>
          ),
        },
        {
          n: "10",
          t: "Data Anak (Pasal 27)",
          body: (
            <>
              Layanan ini ditujukan untuk pengguna dewasa. Kami tidak secara sadar mengumpulkan data pribadi anak
              tanpa persetujuan orang tua/wali.
            </>
          ),
        },
        {
          n: "11",
          t: "Perubahan Kebijakan",
          body: (
            <>
              Kebijakan ini dapat diperbarui dari waktu ke waktu. Perubahan material akan diumumkan melalui situs ini.
            </>
          ),
        },
      ].map((s) => (
        <section key={s.n} className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--text)]">
            <span className="text-[var(--acc-red)] mr-2">{s.n}.</span>
            {s.t}
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
        </section>
      ))}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)] leading-relaxed">
        <p>
          Pertanyaan terkait privasi atau permohonan hak subjek data:{" "}
          <a href="mailto:tim@pancasila.site" className="text-[var(--acc-sky)] font-semibold hover:underline">
            tim@pancasila.site
          </a>
          . Kelola data Anda di{" "}
          <Link href="/pengaturan" className="text-[var(--acc-sky)] font-semibold hover:underline">
            halaman Pengaturan
          </Link>.
        </p>
      </div>
    </div>
  );
}
