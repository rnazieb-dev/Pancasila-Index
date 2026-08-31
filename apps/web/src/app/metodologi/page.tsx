import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import {
  dimensionInfluence,
  scoreToIndex,
  MAX_UNCERTAINTY_HALFWIDTH,
  NON_DEROGABLE_CAPS,
  MIN_GROUP_COVERAGE,
  MIN_COVERAGE_FOR_INDEX,
} from "@pancasila-index/core";
import { Tex } from "@/components/tex";
import { MethodologyTabs, type Tab } from "@/components/methodology-tabs";
import { MethodologyCalculator } from "@/components/methodology-calculator";

export const metadata = {
  title: "Metodologi & Kerangka Epistemologis",
  description:
    "Metodologi penelitian, formulasi matematis, hierarki 5 strata bukti primer, 7 triangulasi indeks independen global, protokol kurasi kuorum ganda, dan simulator penskoran interaktif Pancasila Index.",
};

const scaleAnchors = [
  {
    v: "+2",
    label: "Selaras Penuh / Teladan Institusional",
    badge: "bg-[var(--acc-emerald)]/15 text-[var(--acc-emerald-strong)] border-[var(--acc-emerald)]/40",
    desc: "Terobosan institusional fundamental yang memperluas jaminan konstitusional, hak sipil, dan akuntabilitas publik secara berkelanjutan.",
    example:
      "UU Pers No. 40/1999 (kebebasan pers mutlak), Pembentukan KPK (UU 30/2002), Pembentukan MK (UU 24/2003), Amandemen Bab XA Hak Asasi Manusia UUD 1945.",
  },
  {
    v: "+1",
    label: "Memperkuat / Positif Progresif",
    badge: "bg-[var(--acc-sky)]/15 text-[var(--acc-sky-strong)] border-[var(--acc-sky)]/40",
    desc: "Kebijakan, undang-undang, atau putusan progresif yang memajukan nilai Pancasila dan kesejahteraan rakyat secara terukur.",
    example:
      "MoU Helsinki Damai Aceh 2005, UU Keterbukaan Informasi Publik No. 14/2008, UU Sistem Jaminan Sosial Nasional / BPJS Kesehatan, Putusan MK No. 168/PUU-XXI/2023 (klaster ketenagakerjaan).",
  },
  {
    v: "0",
    label: "Netral / Rutin / Berimbang",
    badge: "bg-[var(--score-zero-bg)] text-[var(--score-zero)] border-[var(--line)]",
    desc: "Kinerja administratif rutin tanpa terobosan baru, fungsi protokoler seremonial, atau capaian positif yang terhapus oleh dampak negatif yang sebanding.",
    example:
      "Sosialisasi seremonial 4 Pilar MPR, pelantikan rutin pejabat negara, perumusan naskah akademik RUU tanpa pengesahan legislasi (DPD soft bicameralism).",
  },
  {
    v: "-1",
    label: "Menggerus / Regresi Kebijakan",
    badge: "bg-[var(--acc-amber)]/15 text-[var(--acc-amber-strong)] border-[var(--acc-amber)]/40",
    desc: "Kebijakan yang memperlemah checks and balances, pembatasan hak tanpa uji proporsionalitas ketat, atau penurunan kualitas partisipasi publik bermakna.",
    example:
      "SKB 3 Menteri Pelarangan Ahmadiyah 2008, suap cek pelawat pemilihan DGS Bank Indonesia (40+ anggota DPR), jual-beli opini WTP oleh oknum auditor BPK.",
  },
  {
    v: "-2",
    label: "Melanggar Berat / Inkonstitusional",
    badge: "bg-[var(--acc-red)]/15 text-[var(--acc-red-strong)] border-[var(--acc-red)]/40",
    desc: "Penyimpangan fundamental terhadap norma struktural UUD 1945, pembunuhan di luar hukum (extrajudicial killings), mafia peradilan puncak, pembangkangan putusan pengadilan, dan pembongkaran sistemik pilar antikorupsi.",
    example:
      "Operasi Petrus 1983–1985 (±10.000 tewas), Penyerbuan 27 Juli 1996, Tragedi Mei 1998, Revisi UU KPK 2019, Perppu Cipta Kerja 2022 (mengakali Putusan MK 91/2020), Putusan MK 90/2023 (vonis etik berat MKMK), Mafia Kasasi Zarof Ricar (Rp920 miliar & 51 kg emas).",
  },
];


export default function MetodologiPage() {
  const influence = dimensionInfluence(dataset.rubric);
  const externalIndices = dataset.external_indices;

  // Angka pada narasi rumus diturunkan dari konstanta scoring engine, bukan
  // ditulis ulang sebagai literal, agar teks tidak bisa menyimpang dari mesin.
  const maxHalfwidthPoints = scoreToIndex(0) - scoreToIndex(-MAX_UNCERTAINTY_HALFWIDTH);
  const severeCapIndex = scoreToIndex(NON_DEROGABLE_CAPS.severe);
  const erosionCapIndex = scoreToIndex(NON_DEROGABLE_CAPS.erosion);

  // Tab 1: Fondasi & Genealogi Intelektual
  const sectionFondasi = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-amber-strong)]">
          Fondasi Epistemologis
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Audit Masa Jabatan Kelembagaan & Genealogi Konstitusi
        </h2>
      </div>

      <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed">
        Pancasila Index dirancang secara sadar untuk menolak <strong>personalisasi politik, kultus figur, dan bias partisan</strong>. Fokus evaluasi platform ini adalah <strong>audit masa jabatan kelembagaan (<em>institutional tenure audit</em>)</strong> terhadap {dataset.institutions.length} organ konstitusional UUD 1945 (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY) dari 1945 hingga era kontemporer.
      </p>

      {/* Dataset Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-center shadow-2xs">
          <div className="font-mono text-2xl sm:text-3xl font-black text-[var(--acc-amber-strong)]">{dataset.institutions.length}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Organ Konstitusional</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-center shadow-2xs">
          <div className="font-mono text-2xl sm:text-3xl font-black text-[var(--acc-sky-strong)]">{dataset.terms.length}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Masa Jabatan Diaudit</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-center shadow-2xs">
          <div className="font-mono text-2xl sm:text-3xl font-black text-[var(--acc-emerald-strong)]">{dataset.events.length}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Peristiwa Multi-Bukti</div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-center shadow-2xs">
          <div className="font-mono text-2xl sm:text-3xl font-black text-[var(--acc-red-strong)]">{dataset.sources.length}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Sumber Primer Aktif</div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/10 p-5 sm:p-7 space-y-4">
        <h3 className=" font-bold text-lg text-[var(--text)]">
          Hermeneutika Sejarah & Harmoni Simbiotik Agama-Negara
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Pancasila Index menolak de-historisasi. Republik Indonesia tidak lahir dari ruang hampa pada 17 Agustus 1945, melainkan berakar dari genealogi pergerakan dua abad yang digerakkan oleh napas keagamaan, perlawanan anti-kolonial, dan tradisi kerakyatan nusantara:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text)] list-disc pl-5">
          <li>
            <strong className="text-[var(--text)]">Syarikat Dagang Islam (1905) & Syarikat Islam (1912):</strong> Titik nol kesadaran kedaulatan mandiri (<em>Zelfbestuur</em>) yang menentang penindasan ekonomi feodal-kolonial dengan etika tauhid kerakyatan.
          </li>
          <li>
            <strong className="text-[var(--text)]">Fusi Nasionalis-Religius:</strong> Gagasan musyawarah mufakat, perikemanusiaan, dan keadilan sosial berakar dari saripati tradisi rembug desa adat dan nilai teologis universal, bukan sekadar saduran demokrasi liberal Barat.
          </li>
          <li>
            <strong className="text-[var(--text)]">Piagam Jakarta 22 Juni 1945 & Dekrit Presiden 5 Juli 1959:</strong> Kompromi luhur para pendiri bangsa yang secara historis dan yuridis menjiwai UUD 1945 serta menempatkan nilai Ketuhanan Yang Maha Esa sebagai bintang pemandu moral bernegara.
          </li>
          <li>
            <strong className="text-[var(--text)]">Prinsip Hermeneutika Non-Anakronisme:</strong> Peristiwa sejarah pra-1945 diperlakukan sebagai khazanah embrio nilai kultural bangsa, bukan sebagai norma hukum positif anakronis.
          </li>
        </ul>
        <div className="pt-2">
          <Link
            href="/akar-sejarah"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--acc-amber-strong)] bg-[var(--acc-amber)]/15 hover:bg-[var(--acc-amber)]/25 px-3.5 py-2 rounded-lg border border-[var(--acc-amber)]/40 transition"
          >
            <span>Telusuri Direktori 38 Tonggak Lini Masa Akar Sejarah &rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );

  // Tab 2: Empat Pilar Riset & 5 Strata Bukti Primer
  const sectionPilar = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-sky-strong)]">
          Kerangka Riset Empiris
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Empat Pilar Riset & Hierarki 5 Strata Bukti Primer
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Pilar 1 */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--acc-sky)]/10 text-[var(--acc-sky-strong)] border border-[var(--acc-sky)]/30">
              Pilar 1
            </span>
            <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
              Analisis Kesetiaan Teks Konstitusi (<em>Constitutional Fidelity</em>)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            Menguji keselarasan tindakan, legislasi, keputusan pejabat, dan putusan peradilan terhadap tiga hierarki konstitusional:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[var(--text)] list-disc pl-5">
            {dataset.rubric.groups.map((g) => {
              const dims = dataset.rubric.dimensions.filter((d) => d.group_id === g.id);
              const porsiGrup = dims.reduce((a, d) => a + (influence.get(d.id) ?? 0), 0);
              const perDimensi = dims.length > 0 ? porsiGrup / dims.length : 0;
              return (
                <li key={g.id}>
                  <strong className="text-[var(--text)]">{g.name_id}</strong>{" "}
                  <span className="font-mono text-[11px] text-[var(--acc-sky-strong)] font-semibold">
                    [Porsi {(porsiGrup * 100).toFixed(0)}% · {dims.length} dimensi · {(perDimensi * 100).toFixed(1)}% per dimensi]
                  </span>
                  : {g.description_id}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pilar 2 */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--acc-red)]/10 text-[var(--acc-red-strong)] border border-[var(--acc-red)]/30">
              Pilar 2
            </span>
            <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
              Analisis Kesenjangan Implementasi (<em>Law-in-Books vs Law-in-Action Gap</em>)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            Membedakan secara tegas antara klaim teks regulasi formal (<em>law in the books</em>) dengan kenyataan penegakan hukum di lapangan (<em>law in action</em>):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)]">
              <div className="font-bold text-xs text-[var(--acc-red-strong)]">Contempt of Court</div>
              <div className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                Mengaudit ketidakpatuhan pejabat pemerintah terhadap putusan pengadilan yang inkracht (PTUN, MK, CLS).
              </div>
            </div>
            <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)]">
              <div className="font-bold text-xs text-[var(--acc-red-strong)]">Korupsi Sistemik</div>
              <div className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                Menelusuri keterlibatan elite peradilan, pimpinan kementerian, dan auditor negara dalam mafia hukum.
              </div>
            </div>
            <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)]">
              <div className="font-bold text-xs text-[var(--acc-red-strong)]">Kriminalisasi vs Impunitas</div>
              <div className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                Membandingkan pemidanaan aktivis/petani dengan remisi massal dan diskon hukuman koruptor kakap.
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 3 */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--acc-emerald)]/10 text-[var(--acc-emerald-strong)] border border-[var(--acc-emerald)]/30">
              Pilar 3
            </span>
            <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
              Hierarki 5 Strata Bukti Primer (<em>Primary Evidence Triangulation</em>)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            Setiap penilaian wajib memiliki minimal satu sitasi bukti primer ber-URL permanen (<em>provenance-backed</em>):
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-start gap-3">
              <span className="font-mono font-black text-[var(--acc-amber-strong)] shrink-0">STRATA I</span>
              <div className="text-[var(--text)]">
                <strong className="text-[var(--text)]">Lembaran Negara RI:</strong> UU, Perppu, Perpres, Keppres, Peraturan Pemerintah resmi.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-start gap-3">
              <span className="font-mono font-black text-[var(--acc-sky-strong)] shrink-0">STRATA II</span>
              <div className="text-[var(--text)]">
                <strong className="text-[var(--text)]">Risalah Sidang Resmi:</strong> Risalah Amandemen UUD 1945 MPR RI, Risalah Rapat Paripurna DPR RI, Risalah Pansus Angket.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-start gap-3">
              <span className="font-mono font-black text-[var(--acc-emerald-strong)] shrink-0">STRATA III</span>
              <div className="text-[var(--text)]">
                <strong className="text-[var(--text)]">Direktori Putusan Pengadilan:</strong> Putusan Mahkamah Konstitusi (MKRI), Putusan Kasasi/PK Mahkamah Agung (MA), Putusan PTUN, Tipikor, MKMK.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-start gap-3">
              <span className="font-mono font-black text-[var(--acc-purple-strong)] shrink-0">STRATA IV</span>
              <div className="text-[var(--text)]">
                <strong className="text-[var(--text)]">Laporan Audit Lembaga Negara:</strong> LHP BPK RI, LAHP Ombudsman RI, Laporan Penyelidikan Komnas HAM, Laporan Komisi Yudisial, Statistik KPK.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-start gap-3">
              <span className="font-mono font-black text-[var(--acc-red-strong)] shrink-0">STRATA V</span>
              <div className="text-[var(--text)]">
                <strong className="text-[var(--text)]">Investigasi Masyarakat Sipil:</strong> Catatan Akhir Tahun KPA, Catatan ICEL/WALHI, Tren Korupsi ICW, Laporan Hak Digital SAFENet, Kertas Kebijakan Koalisi Reformasi Keamanan.
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 4 */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--acc-amber)]/10 text-[var(--acc-amber-strong)] border border-[var(--acc-amber)]/30">
              Pilar 4
            </span>
            <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
              Triangulasi {externalIndices.length} Indeks Independen Pihak Ketiga
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            Untuk membongkar bias birokrasi dan laporan seremonial, platform mengintegrasikan {externalIndices.length} indeks independen berbasis data keras (<em>hard data</em>) dan <em>expert-coded double-blind</em>. Setiap indeks tertaut ke sumber penerbitnya agar dapat diverifikasi mandiri:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {externalIndices.map((idx) => (
              <div
                key={idx.id}
                className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] space-y-1"
              >
                <div className="font-bold text-xs text-[var(--text)]">{idx.name}</div>
                <div className="text-[10px] text-[var(--acc-amber-strong)] font-semibold">{idx.publisher}</div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">{idx.description}</p>
                {idx.url && (
                  <a
                    href={idx.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] font-mono font-bold text-[var(--acc-sky-strong)] hover:underline pt-0.5"
                  >
                    Sumber penerbit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // Tab 3: Rubrik 12 Dimensi & Jangkar Perilaku (-2 s.d. +2)
  const sectionSkala = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-emerald-strong)]">
          Instrumen Penilaian
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Rubrik 12 Dimensi & Jangkar Perilaku (-2 s.d. +2)
        </h2>
      </div>

      {/* Skala -2 s.d. +2 */}
      <div className="space-y-3">
        <h3 className=" font-bold text-lg text-[var(--text)]">
          Jangkar Perilaku Kuantitatif (-2 s.d. +2)
        </h3>
        <div className="space-y-3">
          {scaleAnchors.map((s) => (
            <div
              key={s.v}
              className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2.5 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded border ${s.badge}`}>
                    {s.v}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-[var(--text)]">
                    {s.label}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                {s.desc}
              </p>
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--muted)]">
                <strong className="text-[var(--text)]">Preseden Empiris:</strong> {s.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matriks 12 Dimensi */}
      <div className="space-y-4 pt-6 border-t border-[var(--line)]">
        <h3 className=" font-bold text-lg text-[var(--text)]">
          Matriks Lengkap 12 Dimensi Konstitusional
        </h3>
        <div className="rounded-xl border border-[var(--acc-sky)]/30 bg-[var(--acc-sky)]/10 p-4 text-xs leading-relaxed text-[var(--text)]">
          <strong className="text-[var(--acc-sky-strong)]">Punya bukti primer untuk salah satu dimensi ini?</strong>{" "}
          Rubrik ini bukan bacaan tertutup. Siapa pun dapat mengusulkan bukti primer beserta
          argumentasinya untuk sebuah dimensi pada masa jabatan tertentu. Usulan ditelaah dua
          kurator independen, lalu dituangkan menjadi perubahan pada berkas kanonik di
          repositori — sehingga angkanya tetap dapat direplikasi siapa pun.
          <div className="pt-2.5">
            <Link
              href="/usulkan-bukti"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--acc-sky)]/40 bg-[var(--acc-sky)]/15 px-3.5 py-2 text-xs font-bold text-[var(--acc-sky-strong)] transition hover:bg-[var(--acc-sky)]/25"
            >
              <span>Usulkan Bukti Primer &rarr;</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {dataset.rubric.dimensions.map((d) => {
            const share = influence.get(d.id) ?? 0;
            return (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--acc-amber-strong)]">
                    {groupName(d.group_id)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {d.non_derogable && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--acc-red)]/10 text-[var(--acc-red-strong)] border border-[var(--acc-red)]/30">
                        Non-Derogable
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--acc-sky)]/10 text-[var(--acc-sky-strong)] border border-[var(--acc-sky)]/30">
                      Porsi {(share * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <h4 className=" font-bold text-sm text-[var(--text)]">
                  {d.name_id}
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {d.question_id}
                </p>
                {/* Jembatan langsung dari rubrik ke jalur bukti: kontributor
                    yang baru membaca sebuah dimensi dapat menyumbang bukti
                    untuk dimensi itu juga tanpa memilih ulang dari awal. */}
                <Link
                  href={`/usulkan-bukti?dimensi=${d.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--acc-sky-strong)] hover:underline"
                >
                  Usulkan bukti primer untuk dimensi ini &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // Tab 4: Formulasi Matematika & Galat
  const sectionAgregasi = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-purple-strong)]">
          Formulasi Matematis
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Algoritma Penskoran, Normalisasi & Rentang Galat
        </h2>
      </div>

      {/* Formula 1 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          1. Rata-Rata Skor Dimensi Polos (<Tex>{String.raw`\bar S_d`}</Tex>)
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Skor dimensi dirata-rata polos lintas penilai independen <Tex>{String.raw`r \in R_d`}</Tex>. Skor tanpa bukti empiris (<em>evidence gap</em>) dikeluarkan dari himpunan <Tex>{String.raw`R_d`}</Tex>:
        </p>
        <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-center text-[var(--text)]">
          <Tex block>{String.raw`\bar S_d = \frac{1}{|R_d|} \sum_{r \in R_d} S_{d,r}`}</Tex>
        </div>
      </div>

      {/* Formula 2 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          2. Skor Kelompok Landasan (<Tex>{String.raw`G_k`}</Tex>)
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Rerata tertimbang dari dimensi dalam kelompok landasan <Tex>{String.raw`G_k`}</Tex>. Keyakinan bukti tidak membobot nilai ini:
        </p>
        <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-center text-[var(--text)]">
          <Tex block>{String.raw`G_k = \frac{\sum_{d \in G_k} \bar S_d \cdot w_d}{\sum_{d \in G_k} w_d}`}</Tex>
        </div>
      </div>

      {/* Formula 3 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          3. Komposit Tertimbang (<Tex>{String.raw`K`}</Tex>) &amp; Normalisasi Indeks 0–100
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Rerata tertimbang antarkelompok landasan menghasilkan komposit <Tex>{String.raw`K`}</Tex> pada rentang
          asli rubrik <Tex>{String.raw`[-2, +2]`}</Tex>, yang kemudian dipetakan linear ke skala indeks 0–100:
        </p>
        <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-center text-[var(--text)] space-y-1">
          <Tex block>{String.raw`K = \frac{\sum_k G_k \cdot W_k}{\sum_k W_k}`}</Tex>
          <Tex block>{String.raw`\text{Indeks} = \min(50 + 25K,\ \text{Batas Hak Dasar})`}</Tex>
        </div>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Bobot kelompok:{" "}
          {dataset.rubric.groups
            .map((g) => `${g.name_id} = ${Math.round(g.weight * 100)}%`)
            .join(", ")}
          .
        </p>
        <div className="p-3.5 rounded-lg border border-[var(--acc-sky)]/30 bg-[var(--acc-sky)]/10 text-xs text-[var(--text)] leading-relaxed">
          <strong className="text-[var(--acc-sky-strong)]">Mengapa keyakinan bukti tidak ikut membobot:</strong>{" "}
          bobot menyatakan <em>seberapa penting</em> sebuah landasan secara normatif, sedangkan keyakinan menyatakan{" "}
          <em>seberapa kuat buktinya</em>. Keduanya tidak boleh dicampur. Jika keyakinan ikut membobot, sebuah lembaga
          dapat memperbaiki skornya cukup dengan membiarkan bukti pada dimensi terburuknya tetap langka — dan itu
          insentif yang salah. Karena itu keyakinan hanya melebarkan rentang ketidakpastian (Bagian 4), tidak pernah
          menggeser nilai tengahnya.
        </div>
      </div>

      {/* Formula 4 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          4. Rentang Ketidakpastian Linear (<Tex>{String.raw`H`}</Tex>) &amp; Batas Hak Mutlak
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Keyakinan bukti melaporkan lebar interval ketidakpastian secara linear (bukan kuadratur), dengan rentang
          maksimal <Tex>{String.raw`\pm ` + maxHalfwidthPoints}</Tex> poin indeks pada keyakinan 0:
        </p>
        <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-center text-[var(--text)] space-y-1">
          <Tex block>{String.raw`H = \frac{\sum w \cdot (1 - c) \cdot h_{\max}}{\sum w}`}</Tex>
          <Tex block>{String.raw`h_{\max} = ` + MAX_UNCERTAINTY_HALFWIDTH + String.raw`\quad (\pm ` + maxHalfwidthPoints + String.raw`\text{ poin indeks})`}</Tex>
        </div>
        <div className="p-3.5 rounded-lg border border-[var(--acc-red)]/30 bg-[var(--acc-red)]/10 text-xs text-[var(--text)] space-y-1">
          <strong className="text-[var(--acc-red-strong)]">Plafon Hak yang Tidak Dapat Dikurangi (Pasal 28I ayat 1 UUD 1945):</strong>
          <div>
            • Skor <Tex>{String.raw`-2`}</Tex> pada dimensi hak asasi mutlak{" "}
            <Tex>{String.raw`\implies`}</Tex> Plafon Indeks Maksimal = {severeCapIndex}.
          </div>
          <div>
            • Skor <Tex>{String.raw`\le -1`}</Tex> pada dimensi hak asasi mutlak{" "}
            <Tex>{String.raw`\implies`}</Tex> Plafon Indeks Maksimal = {erosionCapIndex}.
          </div>
        </div>
      </div>

      {/* Catatan Celah Terbuka */}
      <div className="rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/10 p-5 space-y-2 text-xs text-[var(--text)]">
        <div className="font-bold text-[var(--acc-amber-strong)] uppercase tracking-wider text-[11px]">
          Deklarasi Transparansi Metodologi: Agregasi Multi-Peristiwa ke Bilangan Bulat
        </div>
        <p className="leading-relaxed">
          Pancasila Index memuat {dataset.events.length} peristiwa empiris. Bagaimana puluhan peristiwa dalam satu
          dimensi diringkas menjadi satu bilangan bulat <Tex>{String.raw`-2 \ldots +2`}</Tex> adalah telaah kualitatif
          dewan kurator (<em>expert judgment</em>) yang didukung bukti primer ber-URL permanen. Yang dapat direplikasi
          sepenuhnya adalah langkah sesudahnya: dari skor dimensi ke indeks komposit (Bagian 1–4). Penurunan skor
          dimensi dari bukti belum merupakan prosedur yang dapat direplikasi, dan dinyatakan sebagai penilaian ahli.
        </p>
        <p className="leading-relaxed pt-1">
          <strong className="text-[var(--acc-amber-strong)]">Dua ambang cakupan yang ikut menentukan angka:</strong>{" "}
          sebuah kelompok landasan hanya ikut membentuk komposit bila minimal{" "}
          {Math.round(MIN_GROUP_COVERAGE * 100)}% dimensinya sudah dinilai; kelompok di bawah ambang itu dikeluarkan
          seluruhnya dan porsinya tidak dialihkan diam-diam ke kelompok lain. Selain itu, indeks tidak diterbitkan
          sama sekali bila kurang dari {Math.round(MIN_COVERAGE_FOR_INDEX * 100)}% dari seluruh{" "}
          {dataset.rubric.dimensions.length} dimensi memiliki penilaian. Karena itu banyak masa jabatan sengaja
          ditampilkan tanpa angka, bukan dengan angka yang dipaksakan.
        </p>
      </div>
    </section>
  );

  // Tab 5: Protokol Kurasi Kuorum Ganda
  const sectionKurasi = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-red-strong)]">
          Tata Kelola Peer-Review
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Protokol Kurasi Kuorum Ganda & Deklarasi Etika AI
        </h2>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-4 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          Siklus Hidup Penilaian (<em>Double-Reviewer Quorum</em>)
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Tidak ada skor atau narasi yang dapat dipublikasikan secara resmi ke publik tanpa persetujuan manual minimal dua orang penelaah independen:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--score-zero-bg)] text-[var(--score-zero)] border border-[var(--line)]">
              Tahap 1
            </span>
            <div className="font-bold text-[var(--text)] pt-1">Draf Asesmen</div>
            <p className="text-[var(--muted)] text-[11px] leading-relaxed">
              Dibuat oleh periset / diusulkan publik / dibantu kecerdasan buatan (<code className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]">human_confirmed: false</code>).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--acc-amber)]/10 text-[var(--acc-amber-strong)] border border-[var(--acc-amber)]/30">
              Tahap 2
            </span>
            <div className="font-bold text-[var(--text)] pt-1">Verifikasi Reviewer 1</div>
            <p className="text-[var(--muted)] text-[11px] leading-relaxed">
              Status beralih ke <code className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]">pending_second</code>. Penelaah 1 memverifikasi keaslian sitasi berkas primer.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--acc-emerald)]/10 text-[var(--acc-emerald-strong)] border border-[var(--acc-emerald)]/30">
              Tahap 3
            </span>
            <div className="font-bold text-[var(--text)] pt-1">Konsensus Reviewer 2</div>
            <p className="text-[var(--muted)] text-[11px] leading-relaxed">
              Status <code className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]">published</code> tercapai. Kuorum <Tex>{String.raw`\ge 2`}</Tex> approver manusia independen (<code className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]">human_confirmed: true</code>).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          Deklarasi Etika AI & Audit Trail Terbuka
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text)] list-disc pl-5">
          <li>
            <strong className="text-[var(--text)]">Peran AI:</strong> Large Language Model hanya bertindak sebagai asisten pencari sitasi dan perangkum dokumen formal. AI tidak memiliki hak menentukan skor final atau mempublikasikan data secara otonom.
          </li>
          <li>
            <strong className="text-[var(--text)]">Audit Log Permanen:</strong> Setiap aksi peninjauan, penolakan, maupun perubahan skor tercatat permanen di <Link href="/kurasi/log" className="text-[var(--acc-sky-strong)] underline">Log Aktivitas Kurasi Publik</Link>.
          </li>
          <li>
            <strong className="text-[var(--text)]">Mirroring Write-Through:</strong> Keputusan final dari database PostgreSQL langsung dicerminkan ke berkas kanonik Git <code className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--text)]">review-state.json</code> agar build open-source tetap dapat direplikasi secara mandiri oleh siapa pun.
          </li>
        </ul>
      </div>
    </section>
  );

  // Tab 6: Simulator Interaktif
  const sectionSimulator = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-amber-strong)]">
          Laboratorium Interaktif
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Simulator & Kalkulator Penskoran Interaktif
        </h2>
      </div>

      <MethodologyCalculator />
    </section>
  );

  // Tab 7: Open Science & API
  const sectionOpenScience = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--acc-emerald-strong)]">
          Sains Terbuka & Integrasi
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Open Science, Unduh Data & REST API Publik
        </h2>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 space-y-4 shadow-2xs">
        <h3 className=" font-bold text-base sm:text-lg text-[var(--text)]">
          Akses Dataset Terbuka (<em>Open Access Datasets</em>)
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
          Seluruh dataset Pancasila Index dapat diunduh secara bebas untuk keperluan riset akademis, jurnalisme data, dan advokasi publik:
        </p>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link
            href="/ekspor"
            className="text-xs font-bold px-3.5 py-2 rounded-lg bg-[var(--text)] text-[var(--panel)] transition hover:opacity-90 cursor-pointer"
          >
            Pusat Unduh Data (CSV & JSON) &rarr;
          </Link>
          <Link
            href="/api-docs"
            className="text-xs font-bold px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--line)] transition cursor-pointer"
          >
            Dokumentasi Interaktif REST API &rarr;
          </Link>
          <a
            href="https://github.com/rnazieb-dev/Pancasila-Index"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--line)] transition cursor-pointer"
          >
            Repositori GitHub &rarr;
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-2xs">
          <div className="font-bold text-xs text-[var(--text)]">Lisensi Konten & Data</div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Seluruh data dan narasi berlisensi <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>. Anda bebas mengutip dan memodifikasi dengan mencantumkan atribusi.
          </p>
        </div>
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-2xs">
          <div className="font-bold text-xs text-[var(--text)]">Lisensi Kode Sumber</div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Kode sumber platform dan scoring engine berlisensi <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong> guna menjamin keterbukaan perangkat lunak secara berkelanjutan.
          </p>
        </div>
      </div>
    </section>
  );

  const tabs: Tab[] = [
    { id: "fondasi", label: "1. Fondasi & Genealogi", badge: "Epistemologi", content: sectionFondasi },
    { id: "pilar", label: "2. Empat Pilar & 5 Bukti", badge: "Riset", content: sectionPilar },
    { id: "skala", label: "3. Rubrik & Jangkar -2..+2", badge: "Rubrik", content: sectionSkala },
    { id: "agregasi", label: "4. Formulasi Matematika", badge: "Formula", content: sectionAgregasi },
    { id: "kurasi", label: "5. Kuorum Peer-Review", badge: "Tata Kelola", content: sectionKurasi },
    { id: "simulator", label: "6. Simulator Interaktif", badge: "Live Engine", content: sectionSimulator },
    { id: "openscience", label: "7. Open Science & API", badge: "Data & API", content: sectionOpenScience },
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-8 sm:py-16 pb-24 overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)] mb-6 sm:mb-8">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Metodologi & Kerangka Epistemologis</span>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-[var(--line)] pb-8 sm:pb-10">
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
          Standar Metodologi Penelitian & Agregasi Indeks v2.0
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text)] leading-tight">
          Metodologi & Kerangka Epistemologis
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-4xl">
          Menilai kesetiaan {dataset.institutions.length} organ konstitusional Indonesia (1945–kini) terhadap Pancasila dan norma struktural UUD 1945 melalui audit masa jabatan kelembagaan berbasis 5 strata bukti primer, agregasi matematis yang terbuka dan dapat direplikasi, pembanding {externalIndices.length} indeks independen global, dan kuorum ganda kurasi manusia.
        </p>
      </header>

      {/* Thematic Tabs Navigation & Content */}
      <MethodologyTabs tabs={tabs} />

      {/* Footer Citation */}
      <footer className="mt-16 pt-8 border-t border-[var(--line)] text-xs text-[var(--muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="max-w-xl leading-relaxed text-center sm:text-left">
          Pancasila Index berkomitmen pada prinsip integritas akademis dan transparansi audit terbuka. Seluruh data asesmen dapat diunduh dan diverifikasi secara mandiri.
        </p>
        <div className="flex gap-4 font-semibold">
          <Link href="/api-docs" className="text-[var(--text)] hover:underline">
            REST API OpenAPI &rarr;
          </Link>
          <Link href="/kurasi/log" className="text-[var(--text)] hover:underline">
            Log Aktivitas Kurasi &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}

function groupName(groupId: string): string {
  return dataset.rubric.groups.find((g) => g.id === groupId)?.name_id ?? groupId;
}
