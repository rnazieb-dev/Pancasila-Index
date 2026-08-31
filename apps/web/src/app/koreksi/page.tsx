import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Koreksi & Hak Jawab",
  description:
    "Mekanisme koreksi skor dan hak jawab (right of reply) untuk subjek yang dinilai dalam Pancasila Index.",
};

export default function KoreksiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Koreksi &amp; Hak Jawab</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text)]">Koreksi Skor &amp; Hak Jawab</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index adalah kompilasi terbuka. Jika Anda merasa
          penilaian terhadap Anda, institusi Anda, atau peristiwa yang Anda
          pahami tidak akurat, ada beberapa jalur yang tersedia. Setiap
          permintaan ditinjau dengan itikad baik.
        </p>
      </header>

      <Section n="1" title="Tiga jalur koreksi">
        <p>Pilih jalur yang sesuai dengan kebutuhan Anda:</p>

        <div className="space-y-4 mt-4">
          <Card
            t="Jalur A — Koreksi data atau bukti (paling kuat)"
            d="Untuk mengusulkan perubahan data (kesalahan tanggal, keliru rujukan, peristiwa yang hilang, sumber yang lebih tepat). Jalur ini menghasilkan perubahan permanen di dataset dan tercatat di riwayat Git."
            cta={
              <a
                href="https://github.com/rnazieb-dev/Pancasila-Index/blob/main/CONTRIBUTING.md"
                className="text-xs font-bold text-[var(--acc-red)] hover:underline"
              >
                Buka CONTRIBUTING.md &rarr;
              </a>
            }
          />

          <Card
            t="Jalur B — Hak jawab (right of reply)"
            d="Untuk Anda atau pihak yang Anda wakili ingin menampilkan tanggapan resmi berdampingan dengan skor yang dipublikasikan. Tanggapan akan ditampilkan apa adanya (tanpa sensor) di samping halaman skor, dengan nama penandatangan dan afiliasi yang diverifikasi."
            cta={
              <a href="#templat" className="text-xs font-bold text-[var(--acc-red)] hover:underline">
                Lihat templat &rarr;
              </a>
            }
          />

          <Card
            t="Jalur C — Klarifikasi umum"
            d="Untuk pertanyaan, klarifikasi, atau diskusi kebijakan tanpa permintaan perubahan data. Pertanyaan akan dijawab di halaman ini atau di halaman FAQ publik bila bersifat umum."
            cta={null}
          />
        </div>
      </Section>

      <Section n="2" title="Prinsip hak jawab">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong className="text-[var(--text)]">Merujuk praktik media profesional</strong>{" "}
            dan{" "}
            <strong className="text-[var(--text)]">UU No. 40 Tahun 1999 tentang Pers, Pasal 11</strong>{" "}
            (hak jawab), Pancasila Index menyediakan ruang untuk
            tanggapan resmi yang ditampilkan berdampingan dengan
            penilaian.
          </li>
          <li>
            <strong className="text-[var(--text)]">Tanggapan tidak disensor secara substansial</strong>.
            Redaksi hanya berhak menolak: (a) ujaran kebencian SARA, (b)
            ancaman kekerasan, (c) iklan terselubung, (d) pencemaran
            nama baik pihak ketiga, (e) konten yang melanggar UU ITE.
          </li>
          <li>
            <strong className="text-[var(--text)]">Verifikasi identitas</strong> dilakukan
            untuk memastikan yang mengajukan adalah benar pihak yang
            relevan. Identitas tidak dipublikasikan kecuali atas izin
            penandatangan.
          </li>
          <li>
            <strong className="text-[var(--text)]">Waktu respons</strong>: pengelola berusaha
            mengakui permintaan dalam 14 hari kerja; hak jawab yang
            lengkap ditayangkan dalam 30 hari kerja, atau dengan
            penjelasan bila melebihi.
          </li>
        </ul>
      </Section>

      <section id="templat" className="space-y-3 scroll-mt-20">
        <h2 className="text-xl font-bold text-[var(--text)]">
          <span className="text-[var(--acc-red)]">3.</span> Templat hak jawab
        </h2>
        <div className="text-sm leading-relaxed text-[var(--text)] space-y-3">
          <p>
            Salin templat di bawah ini, isi dengan tanggapan Anda, dan
            kirim ke kontak pengelola. Lampirkan juga dokumen pendukung
            (jabatan resmi, surat kuasa, dll.) bila diminta.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-xs leading-relaxed text-[var(--text)]">
{`PERMOHONAN HAK JAWAB — Pancasila Index
========================================

Kepada: PT Aplikasi Profisi Indonesia (pengelola Pancasila Index)

1. IDENTITAS PEMOHON
   Nama lengkap        :
   Jabatan / afiliasi  :
   Kaitannya dengan    :
   (perorangan / institusi yang dinilai)
   Kontak verifikasi   :
   (email / telepon)

2. HAL YANG DIMINTA DIJAWAB
   Halaman / URL       :
   Peristiwa / skor    :
   (mis. "Skor sila-3 untuk masa jabatan Presiden X, peristiwa ev-yyyy-...")

3. TANGGAPAN RESMI
   (tulis dengan jelas; akan ditampilkan apa adanya)
   ........................................................
   ........................................................
   ........................................................

4. DOKUMEN PENDUKUNG
   (cantumkan, bila ada)
   - ...
   - ...

5. PERNYATAAN
   Saya menyatakan bahwa tanggapan di atas adalah benar dan
   disampaikan dengan itikad baik. Saya memahami bahwa:
   - Tanggapan akan ditampilkan di samping skor tanpa sensor
     substansial, kecuali melanggar UU ITE.
   - Identitas saya akan diverifikasi tetapi tidak akan ditampilkan
     tanpa izin.
   - Pengajuan palsu dapat diproses sesuai hukum yang berlaku.

Tanda tangan      : ____________________
Tanggal           : ____________________
Tempat            : ____________________
`}
          </pre>
        </div>
      </section>

      <Section n="4" title="Kontak & alur pengajuan">
        <p>
          Permohonan hak jawab dan klarifikasi dapat ditujukan ke
          kontak pengelola yang tercantum di{" "}
          <Link href="/legal" className="underline hover:text-[var(--text)]">LEGAL.md</Link> pada
          repositori publik. Mohon tidak mengirim informasi sensitif
          (konten terenkripsi atau kredensial) dalam surel pertama —
          pengelola akan meminta saluran aman bila diperlukan.
        </p>
        <p>
          Laporan kerentanan keamanan (bukan klarifikasi skor) tetap
          melalui <Link href="/security" className="underline hover:text-[var(--text)]">SECURITY.md</Link>{" "}
          dan jalur Security Advisories GitHub.
        </p>
      </Section>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[var(--text)]">
        <span className="text-[var(--acc-red)]">{n}.</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text)]">
        {children}
      </div>
    </section>
  );
}

function Card({
  t,
  d,
  cta,
}: {
  t: string;
  d: string;
  cta: React.ReactNode | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 space-y-2">
      <h3 className="text-sm font-bold text-[var(--text)]">{t}</h3>
      <p className="text-xs leading-relaxed text-[var(--muted)]">{d}</p>
      {cta && <div className="pt-1">{cta}</div>}
    </div>
  );
}
