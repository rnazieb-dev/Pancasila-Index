import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Akar Sejarah & Genealogi Pancasila | Pancasila Index",
  description: "Menelusuri rekam jejak perjuangan pergerakan Islam, Syarikat Dagang Islam, Syarikat Islam, hingga Piagam Jakarta sebagai fondasi NKRI.",
};

export default function AkarSejarahPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-8"
      >
        &larr;
        Kembali ke Beranda
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Akar Sejarah & Genealogi Pancasila</h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          Pancasila Index menolak de-historisasi narasi kemerdekaan. Halaman ini didedikasikan untuk merawat memori kolektif bahwa negara ini tidak lahir dari ruang hampa pada 17 Agustus 1945, melainkan dari embrio pergerakan panjang yang dipelopori oleh umat Islam dan kaum kebangsaan. 
        </p>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--line)] before:to-transparent">
        
        {/* Timeline Item 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--bg)] bg-[var(--acc-emerald)] text-[var(--bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow font-bold text-xs z-10">
            1905
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Syarikat Dagang Islam (SDI)</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Didirikan oleh Haji Samanhudi di Solo. Menjadi titik nol kebangkitan ekonomi dan perlawanan pribumi muslim terhadap monopoli kolonial dan dominasi asing, membangun fondasi solidaritas berbasis keislaman.
            </p>
          </div>
        </div>

        {/* Timeline Item 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--bg)] bg-[var(--acc-emerald)] text-[var(--bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow font-bold text-xs z-10">
            1912
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Syarikat Islam & Zelfbestuur</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Di bawah kepemimpinan H.O.S. Tjokroaminoto, SDI bertransformasi menjadi Syarikat Islam (SI). SI menjadi pergerakan politik massa pertama yang menyemaikan gagasan <em>Zelfbestuur</em> (pemerintahan sendiri) dan merumuskan fusi antara tauhid, sosialisme-religius, dan anti-imperialisme.
            </p>
          </div>
        </div>

        {/* Timeline Item 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--bg)] bg-[var(--acc-emerald)] text-[var(--bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow font-bold text-xs z-10">
            1945
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Piagam Jakarta (22 Juni)</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Panitia Sembilan merumuskan Piagam Jakarta yang memuat frasa "Ketuhanan, dengan kewajiban menjalankan syari'at Islam bagi pemeluk-pemeluknya". Piagam ini menjadi titik kulminasi musyawarah dan kompromi luhur para pendiri bangsa yang secara historis menjiwai UUD 1945.
            </p>
          </div>
        </div>

        {/* Timeline Item 4 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--bg)] bg-[var(--acc-emerald)] text-[var(--bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow font-bold text-xs z-10">
            1959
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Dekrit Presiden 5 Juli</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Menyatakan secara konstitusional bahwa Piagam Jakarta tertanggal 22 Juni 1945 menjiwai Undang-Undang Dasar 1945 dan adalah merupakan suatu rangkaian kesatuan dengan konstitusi tersebut. Pengakuan formal bahwa agama dan negara tidak terpisahkan dalam lanskap politik Indonesia.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-16 p-6 rounded-xl border border-[var(--acc-red)] bg-[var(--acc-red)]/5 text-[var(--text)]">
        <h3 className="font-bold text-xl text-[var(--acc-red)] mb-3">Sanksi De-Historisasi</h3>
        <p className="text-sm leading-relaxed mb-4">
          Dalam penilaian Pancasila Index modern (1945 - sekarang), memori kolektif ini dijaga secara ketat melalui <strong>Rubrik Sila ke-3 (Persatuan Indonesia)</strong> dan <strong>Sila ke-1 (Ketuhanan)</strong>.
        </p>
        <p className="text-sm leading-relaxed font-medium">
          Setiap lembaga negara atau rezim pemerintahan yang secara sengaja mengeluarkan kebijakan untuk mendistorsi, mengaburkan, atau menghapus sejarah pergerakan umat Islam ini akan langsung menerima penalti evaluasi (-2) sebagai bentuk pembangkangan terhadap konstitusi historis bangsa.
        </p>
      </div>

    </div>
  );
}
