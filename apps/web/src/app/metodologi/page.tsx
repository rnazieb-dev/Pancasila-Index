import { dataset } from "@pancasila-index/data";
import { MethodologyTabs, type Tab } from "@/components/methodology-tabs";

export const metadata = {
  title: "Metodologi — Pancasila Index",
};

const scale = [
  { v: "-2", label: "Melanggar berat", desc: "Pelanggaran sistemik terhadap norma; impunitas aktif.", example: "Extrajudicial killings, korupsi lembaga tertinggi, pembangkangan putusan pengadilan." },
  { v: "-1", label: "Menggerus", desc: "Erosi berulang; pembatasan tanpa uji proporsionalitas.", example: "SKB minoritas, kriminalisasi ekspresi sipil." },
  { v: "0", label: "Netral / Rutin", desc: "Kinerja administratif rutin tanpa terobosan baru, fungsi protokoler seremonial.", example: "Sosialisasi rutin 4 Pilar MPR, tugas harian birokrasi." },
  { v: "+1", label: "Memperkuat", desc: "Penguatan konkret dan terukur atas norma.", example: "UU Keterbukaan Informasi Publik, MoU Damai." },
  { v: "+2", label: "Selaras penuh", desc: "Teladan institusional yang berkelanjutan dan terobosan perluasan jaminan HAM.", example: "Pembentukan KPK, Pembentukan MK." },
];

export default function MetodologiPage() {
  const sectionFondasi = (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Fondasi Metodologis</h2>
      <p className="text-[var(--muted)] leading-relaxed text-sm">
        Pancasila Index dirancang secara sadar untuk menolak personalisasi politik, kultus figur, dan bias partisan. 
        Fokus evaluasi adalah <strong>audit masa jabatan kelembagaan (institutional tenure audit)</strong> terhadap 8 organ konstitusional UUD 1945 dari 1945 hingga kini.
      </p>
      <p className="text-[var(--muted)] leading-relaxed text-sm">
        Kredibilitas indeks bergantung sepenuhnya pada keterbukaan metode. Halaman ini merangkum cara kerja sistem; 
        versi lengkap yang dapat diaudit secara mandiri hidup sebagai data di repositori terbuka.
      </p>
    </section>
  );

  const sectionPilar = (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Empat Pilar Metodologi Riset</h2>
      
      <div className="space-y-5">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="font-semibold text-lg text-[var(--text)]">Pilar 1: Analisis Kesetiaan Teks Konstitusi</h3>
          <p className="text-sm text-[var(--muted)] mt-2">
            Menguji keselarasan tindakan, undang-undang, keputusan presiden, dan putusan yudikatif terhadap:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)] list-disc pl-5">
            {dataset.rubric.groups.map((g) => (
              <li key={g.id} className="leading-relaxed">
                <strong className="text-[var(--text)]">{g.name_id}</strong> (bobot {g.weight}) — {g.description_id.trim()}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="font-semibold text-lg text-[var(--text)]">Pilar 2: Analisis Kesenjangan Eksekusi</h3>
          <p className="text-sm text-[var(--muted)] mt-2">
            Membedakan secara tegas antara klaim teks regulasi formal <em>(law in the books)</em> dengan kenyataan penegakan hukum di lapangan <em>(law in action)</em>.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)] list-disc pl-5 marker:text-[var(--text)]">
            <li><strong>Contempt of Court:</strong> Mengaudit ketidakpatuhan pejabat pemerintah terhadap putusan pengadilan yang inkracht.</li>
            <li><strong>Korupsi Sistemik:</strong> Menelusuri penangkapan dan tindak pidana korupsi yang terbukti di lembaga penegak hukum dan kementerian.</li>
            <li><strong>Kriminalisasi vs Impunitas:</strong> Membandingkan pemidanaan berat rakyat sipil (aktivis, petani) dengan perlakuan istimewa elite (remisi, pembebasan bersyarat).</li>
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="font-semibold text-lg text-[var(--text)]">Pilar 3: Triangulasi Multi-Bukti Primer</h3>
          <p className="text-sm text-[var(--muted)] mt-2 mb-4">
            Setiap skor penilaian wajib bersitasi minimal satu instrumen bukti primer resmi:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-sm">Lembaran Negara RI</div>
              <div className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">UU, Perppu, Perpres, Keppres.</div>
            </div>
            <div className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-sm">Direktori Putusan</div>
              <div className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">Putusan MK, MA, PTUN, Tipikor, MKMK.</div>
            </div>
            <div className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-sm">Laporan Audit Negara</div>
              <div className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">LHP BPK, Laporan Komnas HAM, KY, KPK, Ombudsman.</div>
            </div>
            <div className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-sm">Investigasi Sipil</div>
              <div className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">Laporan KPA, ICW, WALHI, SAFENet, Koalisi Sipil.</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <h3 className="font-semibold text-lg text-[var(--text)]">Pilar 4: Validasi Silang Indeks Global</h3>
          <p className="text-sm text-[var(--muted)] mt-2 mb-4">
            Mengintegrasikan 8 indeks independen pihak ketiga yang berbasis data keras guna membongkar bias birokrasi:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--muted)]">
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>WJP Rule of Law Index</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>Corruption Perceptions Index</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>Index of Public Integrity (IPI)</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>V-Dem Democracy Index</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>Open Budget Index (OBI)</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>OECD Public Integrity</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>RSF World Press Freedom Index</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✔</span> <span>Indeks Supremasi Sipil & Integritas</span></li>
          </ul>
        </div>
      </div>
    </section>
  );

  const sectionSkala = (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Skala Rubrik & Dimensi</h2>
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Penilaian menggunakan 12 dimensi turunan UUD 1945 dengan skala kuantitatif -2 hingga +2.
      </p>

      <div className="pt-2">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Skala Penilaian (-2 s.d. +2)</h3>
        <div className="space-y-3">
          {scale.map((s) => (
            <div key={s.v} className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
              <div
                className="font-mono text-xl font-bold sm:w-12 shrink-0 flex items-center justify-center sm:justify-start"
                style={{ color: s.v.startsWith("-") ? "#fb923c" : s.v === "0" ? "#94a3b8" : "#22c55e" }}
              >
                {s.v}
              </div>
              <div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-sm text-[var(--muted)] mt-1">{s.desc}</div>
                {s.example && (
                  <div className="text-xs text-[var(--muted)] mt-2.5 bg-[var(--bg)] p-2.5 rounded-lg border border-[var(--line)] leading-relaxed">
                    <strong className="text-[var(--text)] font-medium">Contoh nyata:</strong> {s.example}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Dua Belas Dimensi Penilaian</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {dataset.rubric.dimensions.map((d) => (
            <div key={d.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-red-500/80 font-bold mb-1.5">{groupName(d.group_id)}</div>
              <div className="text-sm font-semibold text-[var(--text)]">{d.name_id}</div>
              <div className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{d.question_id.trim()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const sectionAgregasi = (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Algoritma & Protokol Kurasi</h2>
      
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h3 className="font-semibold text-lg text-[var(--text)]">Algoritma Penskoran</h3>
        <ol className="mt-4 space-y-3 text-sm text-[var(--muted)] list-decimal pl-5 marker:text-[var(--text)]">
          <li className="leading-relaxed"><strong>Rata-rata Skor Dimensi:</strong> Skor dimensi dirata-rata lintas reviewer untuk masa jabatan yang sama, dibobot dengan tingkat keyakinan <em>(confidence)</em>.</li>
          <li className="leading-relaxed"><strong>Skor Kelompok Landasan:</strong> Rerata tertimbang bobot dimensi × keyakinan reviewer.</li>
          <li className="leading-relaxed"><strong>Indeks Komposit Konstitusional:</strong> Peta linier (0–100) dari rerata tertimbang antargrup. Cakupan penilaian yang kosong (parsial) akan menurunkan kontribusi total.</li>
        </ol>
        <div className="mt-5 p-3.5 bg-[var(--bg)] rounded-lg border border-[var(--line)] font-mono text-xs text-center text-[var(--muted)] tracking-wide">
          Indeks = 50 + 25 &times; Σ(Grup_k &times; Bobot_k)
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h3 className="font-semibold text-lg text-[var(--text)]">Protokol Kurasi (Double-Reviewer)</h3>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          Tidak ada data asesmen yang dipublikasikan secara final tanpa persetujuan manusia.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)] list-disc pl-5 marker:text-[var(--text)]">
          <li className="leading-relaxed"><strong>Siklus Hidup:</strong> Draft &rarr; Pending (Reviewer 1) &rarr; Published (Kuorum &ge; 2 reviewer independen).</li>
          <li className="leading-relaxed"><strong>Peran AI:</strong> Mesin boleh mengusulkan draf rasional dan mencari sitasi primer, namun validasi akhir mutlak berada di tangan manusia (<code>human_confirmed=true</code>).</li>
          <li className="leading-relaxed"><strong>Transparansi:</strong> Seluruh histori telaah terekam permanen dalam Audit Log. Ketidaksetujuan antar reviewer ditampilkan publik, tidak dirata-ratakan secara diam-diam.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h3 className="font-semibold text-lg text-[var(--text)]">Batasan & Etika</h3>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)] list-disc pl-5 marker:text-[var(--text)]">
          <li className="leading-relaxed">Indeks adalah lensa analitis normatif, bukan vonis hukum maupun kebenaran absolut.</li>
          <li className="leading-relaxed">Rubrik yang sama diterapkan ke semua era dan lembaga — tidak ada aktor yang diistimewakan.</li>
          <li className="leading-relaxed">Rubrik berversi semver; perubahan struktur menghasilkan versi baru, riwayat lama tidak ditulis ulang.</li>
          <li className="leading-relaxed">Seluruh dataset berlisensi CC BY-SA 4.0; setiap klaim wajib bersitasi sumber primer.</li>
        </ul>
      </div>
    </section>
  );

  const tabs: Tab[] = [
    { id: "fondasi", label: "Fondasi Metodologis", content: sectionFondasi },
    { id: "pilar", label: "Empat Pilar Riset", content: sectionPilar },
    { id: "skala", label: "Rubrik & Dimensi", content: sectionSkala },
    { id: "agregasi", label: "Agregasi & Kurasi", content: sectionAgregasi },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Metodologi</h1>
      
      <MethodologyTabs tabs={tabs} />
    </div>
  );
}

function groupName(groupId: string): string {
  return dataset.rubric.groups.find((g) => g.id === groupId)?.name_id ?? groupId;
}
