import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import { dimensionInfluence } from "@pancasila-index/core";
import { MethodologyTabs, type Tab } from "@/components/methodology-tabs";
import { MethodologyCalculator } from "@/components/methodology-calculator";

export const metadata = {
  title: "Metodologi & Kerangka Epistemologis — Pancasila Index",
  description:
    "Metodologi penelitian, formulasi matematis, hierarki 5 strata bukti primer, 8 triangulasi indeks independen global, protokol kurasi kuorum ganda, dan simulator penskoran interaktif Pancasila Index.",
};

const scaleAnchors = [
  {
    v: "+2",
    label: "Selaras Penuh / Teladan Institusional",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    desc: "Terobosan institusional fundamental yang memperluas jaminan konstitusional, hak sipil, dan akuntabilitas publik secara berkelanjutan.",
    example:
      "UU Pers No. 40/1999 (kebebasan pers mutlak), Pembentukan KPK (UU 30/2002), Pembentukan MK (UU 24/2003), Amandemen Bab XA Hak Asasi Manusia UUD 1945.",
  },
  {
    v: "+1",
    label: "Memperkuat / Positif Progresif",
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    desc: "Kebijakan, undang-undang, atau putusan progresif yang memajukan nilai Pancasila dan kesejahteraan rakyat secara terukur.",
    example:
      "MoU Helsinki Damai Aceh 2005, UU Keterbukaan Informasi Publik No. 14/2008, UU Sistem Jaminan Sosial Nasional / BPJS Kesehatan, Putusan MK No. 168/PUU-XXI/2023 (klaster ketenagakerjaan).",
  },
  {
    v: "0",
    label: "Netral / Rutin / Berimbang",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    desc: "Kinerja administratif rutin tanpa terobosan baru, fungsi protokoler seremonial, atau capaian positif yang terhapus oleh dampak negatif yang sebanding.",
    example:
      "Sosialisasi seremonial 4 Pilar MPR, pelantikan rutin pejabat negara, perumusan naskah akademik RUU tanpa pengesahan legislasi (DPD soft bicameralism).",
  },
  {
    v: "-1",
    label: "Menggerus / Regresi Kebijakan",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    desc: "Kebijakan yang memperlemah checks and balances, pembatasan hak tanpa uji proporsionalitas ketat, atau penurunan kualitas partisipasi publik bermakna.",
    example:
      "SKB 3 Menteri Pelarangan Ahmadiyah 2008, suap cek pelawat pemilihan DGS Bank Indonesia (40+ anggota DPR), jual-beli opini WTP oleh oknum auditor BPK.",
  },
  {
    v: "-2",
    label: "Melanggar Berat / Inkonstitusional",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    desc: "Penyimpangan fundamental terhadap norma struktural UUD 1945, pembunuhan di luar hukum (extrajudicial killings), mafia peradilan puncak, pembangkangan putusan pengadilan, dan pembongkaran sistemik pilar antikorupsi.",
    example:
      "Operasi Petrus 1983–1985 (±10.000 tewas), Penyerbuan 27 Juli 1996, Tragedi Mei 1998, Revisi UU KPK 2019, Perppu Cipta Kerja 2022 (mengakali Putusan MK 91/2020), Putusan MK 90/2023 (vonis etik berat MKMK), Mafia Kasasi Zarof Ricar (Rp920 miliar & 51 kg emas).",
  },
];

const externalIndices = [
  {
    name: "WJP Rule of Law Index",
    provider: "World Justice Project (Washington, D.C.)",
    focus: "Batasan kekuasaan pemerintah, ketiadaan korupsi, hak dasar, ketertiban, keadilan perdata & pidana.",
    method: "Survei representatif populasi umum (GPP) dan kuesioner praktisi hukum independen (QRQ).",
  },
  {
    name: "Corruption Perceptions Index (CPI)",
    provider: "Transparency International (Berlin)",
    focus: "Tingkat persepsi korupsi sektor publik dan penegakan integritas pejabat negara.",
    method: "Komposit 13 survei dan asesmen risiko bisnis/tata kelola independen (World Bank, WEF, EIU, dll).",
  },
  {
    name: "Index of Public Integrity (IPI)",
    provider: "ERCAS (European Research Centre for Anti-Corruption)",
    focus: "Kapasitas masyarakat mengendalikan korupsi: independensi peradilan, transparansi anggaran, kebebasan pers.",
    method: "Data objektif berbasis data keras (bukan sekadar persepsi opini).",
  },
  {
    name: "V-Dem Democracy Indices",
    provider: "V-Dem Institute (University of Gothenburg)",
    focus: "Kualitas musyawarah publik (deliberative democracy), kontrol yudisial atas eksekutif, integritas elektoral.",
    method: "Ahli ganda dengan model pengukuran Bayesian Item Response Theory (IRT) lintas negara.",
  },
  {
    name: "Open Budget Index (OBI)",
    provider: "International Budget Partnership (IBP)",
    focus: "Keterbukaan dokumen APBN, pengawasan legislatif, dan partisipasi publik dalam anggaran.",
    method: "Audit komparatif 109 indikator independen atas dokumen anggaran resmi negara.",
  },
  {
    name: "OECD Public Integrity Indicators",
    provider: "OECD Directorate for Public Governance",
    focus: "Mitigasi konflik kepentingan, transparansi lobi, perlindungan pelapor (whistleblower), audit internal.",
    method: "Verifikasi kepatuhan regulasi dan implementasi standar integritas publik OECD.",
  },
  {
    name: "World Press Freedom Index",
    provider: "Reporters Without Borders (RSF, Paris)",
    focus: "Kebebasan jurnalis, pluralisme media, represi hukum, dan keamanan fisik wartawan.",
    method: "Evaluasi kuantitatif pelanggaran fisik dikombinasikan dengan kuesioner ahli 5 konteks.",
  },
  {
    name: "Indeks Supremasi Sipil & Sektor Keamanan",
    provider: "Koalisi Masyarakat Sipil Reformasi Sektor Keamanan (Imparsial, KontraS, PBHI, ELSAM)",
    focus: "Pengawasan dwifungsi aparat militer/kepolisian dalam jabatan sipil ASN/BUMN dan netralitas keamanan.",
    method: "Pemantauan berkala penempatan perwira aktif, tindak kekerasan berlebih, dan akuntabilitas peradilan militer.",
  },
];

export default function MetodologiPage() {
  const influence = dimensionInfluence(dataset.rubric);

  // Tab 1: Fondasi & Genealogi Intelektual
  const sectionFondasi = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Fondasi Epistemologis
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Audit Masa Jabatan Kelembagaan & Genealogi Konstitusi
        </h2>
      </div>

      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
        Pancasila Index dirancang secara sadar untuk menolak <strong>personalisasi politik, kultus figur, dan bias partisan</strong>. Fokus evaluasi platform ini adalah <strong>audit masa jabatan kelembagaan (*institutional tenure audit*)</strong> terhadap 8 organ konstitusional UUD 1945 (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY) dari 1945 hingga era kontemporer.
      </p>

      {/* Dataset Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-center">
          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">8</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-1">Organ Konstitusional</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-center">
          <div className="font-mono text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400">45</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-1">Masa Jabatan Diaudit</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-center">
          <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">653</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-1">Peristiwa Multi-Bukti</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-center">
          <div className="font-mono text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">578</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-1">Sumber Primer Aktif</div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-5 sm:p-7 space-y-4">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
          Hermeneutika Sejarah & Harmoni Simbiotik Agama-Negara
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Pancasila Index menolak de-historisasi. Republik Indonesia tidak lahir dari ruang hampa pada 17 Agustus 1945, melainkan berakar dari genealogi pergerakan dua abad yang digerakkan oleh napas keagamaan, perlawanan anti-kolonial, dan tradisi kerakyatan nusantara:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 font-serif">
          <li>
            <strong>Syarikat Dagang Islam (1905) & Syarikat Islam (1912):</strong> Titik nol kesadaran kedaulatan mandiri (*Zelfbestuur*) yang menentang penindasan ekonomi feodal-kolonial dengan etika tauhid kerakyatan.
          </li>
          <li>
            <strong>Fusi Nasionalis-Religius:</strong> Gagasan musyawarah mufakat, perikemanusiaan, dan keadilan sosial berakar dari saripati tradisi rembug desa adat dan nilai teologis universal, bukan sekadar saduran demokrasi liberal Barat.
          </li>
          <li>
            <strong>Piagam Jakarta 22 Juni 1945 & Dekrit Presiden 5 Juli 1959:</strong> Kompromi luhur para pendiri bangsa yang secara historis dan yuridis menjiwai UUD 1945 serta menempatkan nilai Ketuhanan Yang Maha Esa sebagai bintang pemandu moral bernegara.
          </li>
          <li>
            <strong>Prinsip Hermeneutika Non-Anakronisme:</strong> Peristiwa sejarah pra-1945 diperlakukan sebagai khazanah embrio nilai kultural bangsa, bukan sebagai norma hukum positif anakronis.
          </li>
        </ul>
        <div className="pt-2">
          <Link
            href="/akar-sejarah"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-lg border border-amber-500/30 transition"
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
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
          Kerangka Riset Empiris
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Empat Pilar Riset & Hierarki 5 Strata Bukti Primer
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Pilar 1 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              Pilar 1
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Analisis Kesetiaan Teks Konstitusi (*Constitutional Fidelity*)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            Menguji keselarasan tindakan, legislasi, keputusan pejabat, dan putusan peradilan terhadap tiga hierarki konstitusional:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 font-serif">
            {dataset.rubric.groups.map((g) => {
              const dims = dataset.rubric.dimensions.filter((d) => d.group_id === g.id);
              const porsiGrup = dims.reduce((a, d) => a + (influence.get(d.id) ?? 0), 0);
              const perDimensi = dims.length > 0 ? porsiGrup / dims.length : 0;
              return (
                <li key={g.id}>
                  <strong className="text-slate-900 dark:text-slate-100">{g.name_id}</strong>{" "}
                  <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                    [Porsi {(porsiGrup * 100).toFixed(0)}% · {dims.length} dimensi · {(perDimensi * 100).toFixed(1)}% per dimensi]
                  </span>
                  : {g.description_id}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pilar 2 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              Pilar 2
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Analisis Kesenjangan Implementasi (*Law-in-Books vs Law-in-Action Gap*)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            Membedakan secara tegas antara klaim teks regulasi formal (*law in the books*) dengan kenyataan penegakan hukum di lapangan (*law in action*):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="font-bold text-xs text-rose-700 dark:text-rose-400">Contempt of Court</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Mengaudit ketidakpatuhan pejabat pemerintah terhadap putusan pengadilan yang inkracht (PTUN, MK, CLS).
              </div>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="font-bold text-xs text-rose-700 dark:text-rose-400">Korupsi Sistemik</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Menelusuri keterlibatan elite peradilan, pimpinan kementerian, dan auditor negara dalam mafia hukum.
              </div>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="font-bold text-xs text-rose-700 dark:text-rose-400">Kriminalisasi vs Impunitas</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Membandingkan pemidanaan aktivis/petani dengan remisi massal dan diskon hukuman koruptor kakap.
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 3 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Pilar 3
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Hierarki 5 Strata Bukti Primer (*Primary Evidence Triangulation*)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            Setiap penilaian wajib memiliki minimal satu sitasi bukti primer ber-URL permanen (*provenance-backed*):
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
              <span className="font-mono font-black text-amber-700 dark:text-amber-400 shrink-0">STRATA I</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Lembaran Negara RI:</strong> UU, Perppu, Perpres, Keppres, Peraturan Pemerintah resmi.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
              <span className="font-mono font-black text-blue-700 dark:text-blue-400 shrink-0">STRATA II</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Risalah Sidang Resmi:</strong> Risalah Amandemen UUD 1945 MPR RI, Risalah Rapat Paripurna DPR RI, Risalah Pansus Angket.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 shrink-0">STRATA III</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Direktori Putusan Pengadilan:</strong> Putusan Mahkamah Konstitusi (MKRI), Putusan Kasasi/PK Mahkamah Agung (MA), Putusan PTUN, Tipikor, MKMK.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
              <span className="font-mono font-black text-purple-700 dark:text-purple-400 shrink-0">STRATA IV</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Laporan Audit Lembaga Negara:</strong> LHP BPK RI, LAHP Ombudsman RI, Laporan Penyelidikan Komnas HAM, Laporan Komisi Yudisial, Statistik KPK.
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
              <span className="font-mono font-black text-rose-700 dark:text-rose-400 shrink-0">STRATA V</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Investigasi Masyarakat Sipil:</strong> Catatan Akhir Tahun KPA, Catatan ICEL/WALHI, Tren Korupsi ICW, Laporan Hak Digital SAFENet, Kertas Kebijakan Koalisi Reformasi Keamanan.
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 4 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Pilar 4
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Triangulasi 8 Indeks Independen Pihak Ketiga
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            Untuk membongkar bias birokrasi dan laporan seremonial, platform mengintegrasikan 8 indeks independen berbasis data keras (*hard data*) dan *expert-coded double-blind*:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {externalIndices.map((idx, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1"
              >
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{idx.name}</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{idx.provider}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{idx.focus}</p>
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
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Instrumen Penilaian
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Rubrik 12 Dimensi & Jangkar Perilaku (-2 s.d. +2)
        </h2>
      </div>

      {/* Skala -2 s.d. +2 */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
          Jangkar Perilaku Kuantitatif (-2 s.d. +2)
        </h3>
        <div className="space-y-3">
          {scaleAnchors.map((s) => (
            <div
              key={s.v}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded border ${s.badge}`}>
                    {s.v}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {s.label}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                {s.desc}
              </p>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-slate-200">Preseden Empiris:</strong> {s.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matriks 12 Dimensi */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
          Matriks Lengkap 12 Dimensi Konstitusional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {dataset.rubric.dimensions.map((d) => {
            const share = influence.get(d.id) ?? 0;
            return (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {groupName(d.group_id)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {d.non_derogable && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        Non-Derogable
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      Porsi {(share * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                  {d.name_id}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                  {d.question_id}
                </p>
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
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
          Formulasi Matematis
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Algoritma Penskoran, Normalisasi & Rentang Galat
        </h2>
      </div>

      {/* Formula 1 */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          1. Rata-Rata Skor Dimensi Polos ($S_d$)
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Skor dimensi dirata-rata polos lintas penilai independen $r \in R_d$. Skor tanpa bukti empiris (*evidence gap*) dikeluarkan dari himpunan $R_d$:
        </p>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-800 dark:text-slate-200">
          {"S̄_d = (1 / |R_d|) · ∑_{r ∈ R_d} S_{d,r}"}
        </div>
      </div>

      {/* Formula 2 */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          2. Skor Kelompok Landasan ($G_k$)
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Rerata tertimbang dari dimensi dalam kelompok landasan $G_k$. Keyakinan bukti tidak membobot nilai ini:
        </p>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-800 dark:text-slate-200">
          {"G_k = (∑_{d ∈ G_k} S̄_d · w_d) / (∑_{d ∈ G_k} w_d)"}
        </div>
      </div>

      {/* Formula 3 */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          3. Indeks Komposit Konstitusional 0–100 ($K$)
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Rerata tertimbang antarkelompok landasan yang dinormalisasi dengan porsi tetap:
        </p>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-800 dark:text-slate-200 space-y-1">
          <div>{"K = (∑_k G_k · W_k · c_k) / (∑_k W_k · c_k)"}</div>
          <div>{"Indeks = min(50 + 25 · K, Batas_Hak_Dasar)"}</div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
          Dengan bobot kelompok tetap: Pancasila = 40%, Pembukaan UUD = 30%, Norma Struktural = 30%.
        </p>
      </div>

      {/* Formula 4 */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          4. Rentang Ketidakpastian Linear ($H$) & Batas Hak Mutlak
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Keyakinan bukti melaporkan lebar interval ketidakpastian secara linear (bukan kuadratur), dengan rentang maksimal $\pm 12.5$ poin indeks pada keyakinan 0:
        </p>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-800 dark:text-slate-200">
          {"H = (∑ w · (1 - c) · h_max) / ∑ w,   h_max = 0.5 (±12.5 poin indeks)"}
        </div>
        <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 text-xs text-slate-700 dark:text-slate-300 space-y-1 font-serif">
          <strong>Plafon Hak yang Tidak Dapat Dikurangi (Pasal 28I ayat 1):</strong>
          <div>• Skor $-2$ pada dimensi hak asasi mutlak $\implies$ Plafon Indeks Maksimal = 25.</div>
          <div>• Skor $\le -1$ pada dimensi hak asasi mutlak $\implies$ Plafon Indeks Maksimal = 50.</div>
        </div>
      </div>

      {/* Catatan Celah Terbuka */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 p-5 space-y-2 text-xs font-serif text-slate-700 dark:text-slate-300">
        <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] font-sans">
          Deklarasi Transparansi Metodologi: Agregasi Multi-Peristiwa ke Bilangan Bulat
        </div>
        <p className="leading-relaxed">
          Pancasila Index memuat 653 peristiwa empiris. Bagaimana puluhan peristiwa dalam satu dimensi diringkas menjadi satu bilangan bulat $-2..+2$ adalah telaah kualitatif dewan kurator (expert judgment) yang didukung bukti primer ber-URL permanen. Angka indeks komposit dihitung 100% secara deterministik dari skor dimensi tersebut.
        </p>
      </div>
    </section>
  );

  // Tab 5: Protokol Kurasi Kuorum Ganda
  const sectionKurasi = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
          Tata Kelola Peer-Review
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Protokol Kurasi Kuorum Ganda & Deklarasi Etika AI
        </h2>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          Siklus Hidup Penilaian (*Double-Reviewer Quorum*)
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Tidak ada skor atau narasi yang dapat dipublikasikan secara resmi ke publik tanpa persetujuan manual minimal dua orang penelaah independen:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Tahap 1
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 pt-1">Draf Asesmen</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Dibuat oleh periset / diusulkan publik / dibantu kecerdasan buatan (`human_confirmed: false`).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Tahap 2
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 pt-1">Verifikasi Reviewer 1</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Status beralih ke `pending_second`. Penelaah 1 memverifikasi keaslian sitasi berkas primer.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Tahap 3
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 pt-1">Konsensus Reviewer 2</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Status `published` tercapai. Kuorum $\ge 2$ approver manusia independen (`human_confirmed: true`).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          Deklarasi Etika AI & Audit Trail Terbuka
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 font-serif">
          <li>
            <strong>Peran AI:</strong> Large Language Model hanya bertindak sebagai asisten pencari sitasi dan perangkum dokumen formal. AI tidak memiliki hak menentukan skor final atau mempublikasikan data secara otonom.
          </li>
          <li>
            <strong>Audit Log Permanen:</strong> Setiap aksi peninjauan, penolakan, maupun perubahan skor tercatat permanen di <Link href="/kurasi/log" className="text-blue-700 dark:text-blue-400 underline">Log Aktivitas Kurasi Publik</Link>.
          </li>
          <li>
            <strong>Mirroring Write-Through:</strong> Keputusan final dari database PostgreSQL langsung dicerminkan ke berkas kanonik Git `review-state.json` agar build open-source tetap dapat direplikasi secara mandiri oleh siapa pun.
          </li>
        </ul>
      </div>
    </section>
  );

  // Tab 6: Simulator Interaktif
  const sectionSimulator = (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Laboratorium Interaktif
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
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
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Sains Terbuka & Integrasi
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Open Science, Unduh Data & REST API Publik
        </h2>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-2xs">
        <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          Akses Dataset Terbuka (*Open Access Datasets*)
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Seluruh dataset Pancasila Index dapat diunduh secara bebas untuk keperluan riset akademis, jurnalisme data, dan advokasi publik:
        </p>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link
            href="/ekspor"
            className="text-xs font-bold px-3.5 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 transition hover:opacity-90"
          >
            Pusat Unduh Data (CSV & JSON) &rarr;
          </Link>
          <Link
            href="/api-docs"
            className="text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Dokumentasi Interaktif REST API &rarr;
          </Link>
          <a
            href="https://github.com/rnazieb-dev/Pancasila-Index"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Repositori GitHub &rarr;
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Lisensi Konten & Data</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
            Seluruh data dan narasi berlisensi <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>. Anda bebas mengutip dan memodifikasi dengan mencantumkan atribusi.
          </p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Lisensi Kode Sumber</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
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
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 font-sans">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 dark:text-slate-200">Metodologi & Kerangka Epistemologis</span>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8 sm:pb-10">
        <div className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Standar Metodologi Penelitian & Agregasi Indeks v2.0
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Metodologi & Kerangka Epistemologis
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl font-serif">
          Menilai kesetiaan 8 organ konstitusional Indonesia (1945–kini) terhadap Pancasila dan norma struktural UUD 1945 melalui audit masa jabatan kelembagaan berbasis 5 strata bukti primer, formula matematika teruji, validasi silang 8 indeks independen global, dan kuorum ganda kurasi manusia.
        </p>
      </header>

      {/* Thematic Tabs Navigation & Content */}
      <MethodologyTabs tabs={tabs} />

      {/* Footer Citation */}
      <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="max-w-xl leading-relaxed text-center sm:text-left font-serif">
          Pancasila Index berkomitmen pada prinsip integritas akademis dan transparansi audit terbuka. Seluruh data asesmen dapat diunduh dan diverifikasi secara mandiri.
        </p>
        <div className="flex gap-4 font-sans font-semibold">
          <Link href="/api-docs" className="text-slate-800 dark:text-slate-200 hover:underline">
            REST API OpenAPI &rarr;
          </Link>
          <Link href="/kurasi/log" className="text-slate-800 dark:text-slate-200 hover:underline">
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
