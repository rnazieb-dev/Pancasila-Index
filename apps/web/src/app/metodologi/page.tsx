import { dataset } from "@pancasila-index/data";

export const metadata = {
  title: "Metodologi — Pancasila Index",
};

const scale = [
  { v: "-2", label: "Melanggar berat", desc: "Pelanggaran sistemik terhadap norma; impunitas aktif." },
  { v: "-1", label: "Menggerus", desc: "Erosi berulang; pembatasan tanpa uji proporsionalitas." },
  { v: "0", label: "Netral", desc: "Tidak ada tindakan signifikan dua arah." },
  { v: "+1", label: "Memperkuat", desc: "Penguatan konkret dan terukur atas norma." },
  { v: "+2", label: "Selaras penuh", desc: "Teladan institusional yang berkelanjutan." },
];

export default function MetodologiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Metodologi</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Kredibilitas indeks bergantung sepenuhnya pada keterbukaan metode. Halaman ini
        merangkum cara kerja sistem; versi lengkap hidup sebagai data di repositori.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">1. Tiga lapis landasan normatif</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)] leading-relaxed list-disc pl-5">
          {dataset.rubric.groups.map((g) => (
            <li key={g.id}>
              <strong className="text-[var(--text)]">{g.name_id}</strong> (bobot{" "}
              {g.weight}) — {g.description_id.trim()}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" id="dimensi">
        <h2 className="text-lg font-semibold">2. Dua belas dimensi penilaian</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {dataset.rubric.dimensions.map((d) => (
            <div key={d.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
              <div className="text-xs uppercase tracking-wide text-red-500/80">{groupName(d.group_id)}</div>
              <div className="text-sm font-medium mt-0.5">{d.name_id}</div>
              <div className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2">{d.question_id.trim()}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">3. Skala -2..+2 dengan jangkar</h2>
        <div className="mt-3 space-y-2">
          {scale.map((s) => (
            <div key={s.v} className="flex gap-3 items-baseline text-sm">
              <span
                className="font-mono font-bold w-8 shrink-0"
                style={{ color: s.v.startsWith("-") ? "#fb923c" : s.v === "0" ? "#94a3b8" : "#22c55e" }}
              >
                {s.v}
              </span>
              <span><strong>{s.label}</strong> — <span className="text-[var(--muted)]">{s.desc}</span></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
          Setiap dimensi memiliki jangkar perilaku lengkap di berkas rubrik, diturunkan
          dari indikator yang merujuk pasal UUD secara eksplisit (lihat halaman Landasan UUD).
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">4. Agregasi</h2>
        <ol className="mt-3 space-y-2 text-sm text-[var(--muted)] leading-relaxed list-decimal pl-5">
          <li>Skor dimensi dirata-rata lintas reviewer untuk masa jabatan yang sama.</li>
          <li>
            Skor grup = rerata tertimbang bobot dimensi × keyakinan reviewer (confidence 0–1).
          </li>
          <li>
            Indeks 0–100 = peta linier dari rerata tertimbang antargrup (bobot{" "}
            {dataset.rubric.groups.map((g) => g.weight).join(":")}); cakupan parsial menurunkan kontribusi grup.
          </li>
        </ol>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Mesin penskoran murni TypeScript dan diuji unit — lihat{" "}
          <code className="text-[var(--text)]">packages/core</code>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">5. Peran AI & kurasi manusia</h2>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Pipeline AI boleh mengusulkan klasifikasi dimensi, draf rasional, dan kandidat
          sitasi dari korpus resmi (JDIH, putusan3.mkri.id). Namun{" "}
          <strong className="text-[var(--text)]">
            tidak ada penilaian yang dipublikasi tanpa persetujuan manusia
          </strong>{" "}
          (<code>human_confirmed=true</code>) dan telaah reviewer kedua. Setiap penilaian
          menyimpan jejak <code>ai_suggested</code> vs konfirmasi manual.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">6. Batasan & etika</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)] leading-relaxed list-disc pl-5">
          <li>Indeks adalah lensa analitis normatif, bukan vonis hukum maupun kebenaran absolut.</li>
          <li>Rubrik sama diterapkan ke semua era dan lembaga — tidak ada aktor istimewa.</li>
          <li>Ketidaksetujuan reviewer ditampilkan, bukan dirata-ratakan diam-diam.</li>
          <li>Rubrik berversi semver; perubahan struktur membuat versi baru, riwayat tak ditulis ulang.</li>
          <li>Seluruh dataset CC BY-SA 4.0; setiap klaim wajib sitasi primer.</li>
        </ul>
      </section>
    </div>
  );
}

function groupName(groupId: string): string {
  return dataset.rubric.groups.find((g) => g.id === groupId)?.name_id ?? groupId;
}
