import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer & Tanggung Jawab Hukum",
  description:
    "Disclaimer publik, identitas pengelola (PT Aplikasi Profesi Indonesia), dan dasar hukum perlindungan pengelola Pancasila Index sesuai peraturan perundangan Republik Indonesia.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Disclaimer</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text)]">Disclaimer &amp; Tanggung Jawab Hukum</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Dokumen ini menjelaskan sifat <strong className="text-[var(--text)]">Pancasila Index</strong>,
          identitas pengelola, dan dasar hukum yang melandasinya sesuai
          peraturan perundangan Republik Indonesia. Terakhir diperbarui:
          30 Agustus 2026.
        </p>
      </header>

      <Section n="1" title="Sifat Indeks">
        <p>
          Pancasila Index adalah <strong className="text-[var(--text)]">kompilasi terbuka dokumen publik
          primer</strong> (Undang-Undang, putusan pengadilan, keputusan
          presiden, peraturan, risalah, arsip nasional) yang disajikan dalam bentuk skor
          per dimensi terhadap delapan organ konstitusional Republik Indonesia.
        </p>
        <p>
          Indeks ini <strong className="text-[var(--text)]">bukan vonis hukum</strong> dan{" "}
          <strong className="text-[var(--text)]">bukan rekomendasi politik</strong>. Setiap angka
          adalah <em>interpretasi berbasis bukti</em>, bukan keputusan
          pengadilan. Pembaca yang menyimpulkan makna politik, etis, atau
          yuridis dari skor tersebut bertindak atas dasar pertimbangannya
          sendiri.
        </p>
      </Section>

      <Section n="2" title="Identitas Pengelola">
        <p>
          Pancasila Index dikelola oleh{" "}
          <strong className="text-[var(--text)]">PT Aplikasi Profesi Indonesia</strong>, badan
          hukum yang berdedikasi pada aplikasi profesional untuk kepentingan
          publik. Pengelola bekerja secara <em>pro bono</em> (tanpa mengambil
          keuntungan finansial dari pengelolaan platform) dengan pendanaan
          yang berasal hanya dari sumbangan individu — lihat{" "}
          <Link href="/transparansi" className="underline hover:text-[var(--text)]">transparansi pendanaan</Link>.
        </p>
        <p>
          Status badan hukum: PT Aplikasi Profesi Indonesia didirikan
          berdasarkan Akta Pendirian dan telah tercatat pada Kementerian
          Hukum dan HAM Republik Indonesia. Informasi lengkap badan hukum
          (NPWP, akta, alamat) tersedia di <Link href="/legal" className="underline hover:text-[var(--text)]">LEGAL.md</Link> di
          repositori publik.
        </p>
      </Section>

      <Section n="3" title="Dasar Hukum & Mitigasi Risiko">
        <p>
          Pengelolaan platform ini merujuk pada kerangka regulasi Republik
          Indonesia berikut:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong className="text-[var(--text)]">UU No. 19 Tahun 2016</strong> tentang Perubahan
            atas UU No. 11 Tahun 2008 tentang Informasi dan Transaksi
            Elektronik (UU ITE), khususnya <strong className="text-[var(--text)]">Pasal 26</strong>{" "}
            (kebebasan menyampaikan pendapat), dengan tetap memperhatikan
            Pasal 27 dan 28.
          </li>
          <li>
            <strong className="text-[var(--text)]">Kitab Undang-Undang Hukum Perdata (KUHPerdata)</strong>,
            khususnya <strong className="text-[var(--text)]">Pasal 1365</strong> (perbuatan melawan
            hukum), <strong className="text-[var(--text)]">Pasal 1367</strong> (itikad baik), dan{" "}
            <strong className="text-[var(--text)]">Pasal 1915</strong> (asumsi reputasi baik sampai
            terbukti sebaliknya).
          </li>
          <li>
            <strong className="text-[var(--text)]">UU No. 28 Tahun 2014</strong> tentang Hak Cipta,
            termasuk ketentuan penggunaan dokumen untuk kepentingan publik
            dengan sitasi.
          </li>
          <li>
            <strong className="text-[var(--text)]">UU No. 27 Tahun 2022</strong> tentang Pelindungan
            Data Pribadi (UU PDP) — kebijakan privasi lengkap di{" "}
            <Link href="/privasi" className="underline hover:text-[var(--text)]">/privasi</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">UU No. 40 Tahun 1999</strong> tentang Pers,
            khususnya <strong className="text-[var(--text)]">Pasal 11</strong> (hak jawab) — lihat{" "}
            <Link href="/koreksi" className="underline hover:text-[var(--text)]">/koreksi</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">UU No. 40 Tahun 2007</strong> tentang Perseroan
            Terbatas, khususnya Pasal 3 (tujuanPerseroan) jo. Pasal 136
            (tanggung jawab badan hukum).
          </li>
        </ul>
        <p>
          Analisis lebih panjang tersedia di{" "}
          <Link href="/legal" className="underline hover:text-[var(--text)]">LEGAL.md</Link> di repositori
          publik, yang merinci pembelaan yang tersedia bila sampai ada
          gugatan, baik perdata maupun pidana.
        </p>
      </Section>

      <Section n="4" title="Pagar Struktural Pengelola">
        <p>
          Untuk menjaga itikad baik dan independensi, pengelola
          menjalankan pagar berikut:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong className="text-[var(--text)]">Setiap skor wajib bersitasi bukti primer</strong> —
            produk hukum, putusan pengadilan, atau dokumen arsip resmi yang
            dapat diverifikasi.
          </li>
          <li>
            <strong className="text-[var(--text)]">Kuorum dua reviewer berbeda nama</strong>{" "}
            sebelum status <code>published</code>, sesuai{" "}
            <code>MIN_APPROVERS=2</code> di mesin kurasi dan branch protection
            di repositori publik.
          </li>
          <li>
            <strong className="text-[var(--text)]">Audit log publik</strong> di{" "}
            <Link href="/kurasi/log" className="underline hover:text-[var(--text)]">/kurasi/log</Link>{" "}
            — setiap keputusan kurasi tercatat dengan jejak yang tidak
            dapat dihapus.
          </li>
          <li>
            <strong className="text-[var(--text)]">Hak jawab (right of reply)</strong> untuk subjek
            yang dinilai — lihat{" "}
            <Link href="/koreksi" className="underline hover:text-[var(--text)]">/koreksi</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">Transparansi pendanaan</strong> — lihat{" "}
            <Link href="/transparansi" className="underline hover:text-[var(--text)]">/transparansi</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">Lisensi terbuka</strong>: kode di bawah AGPL-3.0
            (copyleft kuat) dan data di bawah CC BY-SA 4.0 (derivatif
            wajib terbuka), sehingga karya ini tidak dapat dieksploitasi
            secara tertutup.
          </li>
        </ul>
      </Section>

      <Section n="5" title="Batas Tanggung Jawab">
        <p>
          Pengelola PT Aplikasi Profesi Indonesia bertindak dengan{" "}
          <strong className="text-[var(--text)]">itikad baik</strong> dan berdasarkan bukti primer
          yang dapat diverifikasi. Pengelola <strong className="text-[var(--text)]">tidak
          bertanggung jawab</strong> atas:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Kesimpulan politik, etis, atau yuridis yang ditarik pembaca dari skor.</li>
          <li>
            Penggunaan skor sebagai alat kampanye, intimidasi, atau
            diskriminasi.
          </li>
          <li>
            Tindakan subjek yang dinilai yang merespons pengungkapan data
            terbuka dengan cara yang melanggar hukum.
          </li>
        </ul>
        <p>
          Pengelola berhak melakukan klarifikasi, koreksi, atau{" "}
          <em>right of reply</em> terhadap penggunaan skor yang
          menyerang prinsip di atas.
        </p>
      </Section>

      <Section n="6" title="Kontak & Pelaporan">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong className="text-[var(--text)]">Koreksi skor atau hak jawab</strong>:{" "}
            <Link href="/koreksi" className="underline hover:text-[var(--text)]">/koreksi</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">Keamanan & kerentanan</strong>:{" "}
            <Link href="/security" className="underline hover:text-[var(--text)]">SECURITY.md</Link>{" "}
            di repositori.
          </li>
          <li>
            <strong className="text-[var(--text)]">Kontak badan hukum</strong>: tersedia di{" "}
            <Link href="/legal" className="underline hover:text-[var(--text)]">LEGAL.md</Link>.
          </li>
        </ul>
      </Section>

      <p className="text-xs text-[var(--muted)] pt-4 border-t border-[var(--line)]">
        Dokumen ini bukan nasihat hukum. Untuk pertanyaan yuridis
        spesifik, konsultasikan dengan advokat berlisensi. Rujukan UU
        dalam dokumen ini merujuk pada versi yang berlaku per tanggal
        pembaruan; perubahan regulasi setelah tanggal tersebut tidak
        tercakup.
      </p>
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
