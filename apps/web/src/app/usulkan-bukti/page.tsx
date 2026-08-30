"use client";

import { useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import {
  IconScale,
  IconInstitution,
  IconShieldCheck,
  IconHistory,
  IconFilePlus,
  IconAuditLog,
} from "@/components/icons";

export default function UsulkanBuktiPage() {
  const [formData, setFormData] = useState({
    title: "",
    institutionId: "presiden-ri",
    termId: "",
    date: "",
    sourceType: "putusan-mk",
    sourceTitle: "",
    sourceCitation: "",
    sourceUrl: "",
    selectedDimensions: [] as string[],
    summary: "",
    submitterName: "",
    submitterAffiliation: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentInstTerms = dataset.terms.filter(
    (t) => t.institution_id === formData.institutionId
  );

  const toggleDimension = (dimId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDimensions: prev.selectedDimensions.includes(dimId)
        ? prev.selectedDimensions.filter((id) => id !== dimId)
        : [...prev.selectedDimensions, dimId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.sourceTitle || formData.selectedDimensions.length === 0) {
      alert("Harap lengkapi judul peristiwa, tanggal, rujukan sumber primer, dan minimal 1 dimensi terkait.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/usulan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirimkan usulan");
      }

      setSubmitted(true);
    } catch (err) {
      alert("Terjadi kesalahan saat mengirim usulan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Usulkan Bukti Primer</span>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500">
          <IconFilePlus size={16} />
          <span>Partisipasi Publik & Peer Review</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-1">
          Usulkan Bukti Primer & Peristiwa
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
          Bantu kami memperkuat penilaian kinerja lembaga negara dengan menyumbangkan bukti primer.
          Anda dapat mengusulkan <strong>dokumen hukum negara</strong> (Putusan MK/MA, UU) maupun <strong>bukti empiris</strong> 
          berupa jurnal akademik (peer-reviewed) dan liputan jurnalistik terverifikasi.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs text-[var(--acc-amber)]">
          <IconScale size={15} className="shrink-0" />
          <span>Setiap usulan wajib melalui proses telaah sejawat dua-reviewer (*two-reviewer quorum*) sebelum diterbitkan.</span>
        </div>
      </div>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-4">
          <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <IconShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold text-emerald-400">Usulan Berhasil Dikirimkan!</h2>
          <p className="text-xs sm:text-sm text-[var(--text)] max-w-lg mx-auto leading-relaxed">
            Terima kasih atas kontribusi Anda. Bukti primer <strong>{formData.title}</strong> telah masuk ke antrean kurasi terbuka untuk diverifikasi oleh para kurator dan penelaah independen.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/peer-review/usulan"
              className="rounded-xl bg-[var(--panel)] border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--acc-sky)] hover:border-sky-500 transition"
            >
              Lihat Antrean Usulan Publik →
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  title: "",
                  institutionId: "presiden-ri",
                  termId: "",
                  date: "",
                  sourceType: "putusan-mk",
                  sourceTitle: "",
                  sourceCitation: "",
                  sourceUrl: "",
                  selectedDimensions: [],
                  summary: "",
                  submitterName: "",
                  submitterAffiliation: "",
                });
              }}
              className="rounded-xl bg-[var(--acc-red)] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              Kirim Usulan Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Section 1: Target Organ & Masa Jabatan */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <IconInstitution size={18} className="text-[var(--acc-sky)]" />
              <span>1. Organ Konstitusional & Periode Terkait</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Organ Konstitusional:
                </label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => {
                    const instId = e.target.value;
                    const terms = dataset.terms.filter((t) => t.institution_id === instId);
                    setFormData({
                      ...formData,
                      institutionId: instId,
                      termId: terms[0]?.id || "",
                    });
                  }}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                  required
                >
                  {dataset.institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name_id} ({inst.short_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Masa Jabatan / Era:
                </label>
                <select
                  value={formData.termId || currentInstTerms[0]?.id || ""}
                  onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                  required
                >
                  {currentInstTerms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.label_id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Peristiwa & Bukti Primer */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>📄</span>
              <span>2. Rincian Peristiwa & Dokumen Bukti Primer</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Judul Peristiwa / Putusan / Kebijakan Hukum:
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Putusan MK Pengujian UU Cipta Kerja No. 91/PUU-XVIII/2020"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Jenis Dokumen Primer:
                </label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                >
                  <optgroup label="Dokumen Negara (Hukum Formal)">
                    <option value="putusan-mk">Putusan Mahkamah Konstitusi (MK)</option>
                    <option value="putusan-ma">Putusan Mahkamah Agung (MA)</option>
                    <option value="undang-undang">Undang-Undang / Perppu (Lembaran Negara)</option>
                    <option value="keppres">Keputusan / Peraturan Presiden</option>
                    <option value="laporan-lembaga">Laporan LHP BPK / Rekomendasi KY</option>
                    <option value="dokumen-mpr">Ketetapan / Risalah Sidang MPR</option>
                  </optgroup>
                  <optgroup label="Kajian Keilmuan & Fakta Empiris">
                    <option value="jurnal">Jurnal Akademik (Peer-Reviewed)</option>
                    <option value="buku">Buku / Monograf Akademik</option>
                    <option value="laporan-lembaga">Laporan Kajian Praktisi / CSO (Think-Tank)</option>
                    <option value="berita">Berita Jurnalistik Terverifikasi (Dewan Pers)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Tanggal Kejadian / Pengesahan:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  {formData.sourceType === "jurnal" || formData.sourceType === "buku"
                    ? "DOI / ISBN / Penulis & Jurnal:"
                    : formData.sourceType === "berita"
                    ? "Nama Media Massa & Jurnalis:"
                    : "Nomor / Sitasi Resmi Dokumen:"}
                </label>
                <input
                  type="text"
                  value={formData.sourceCitation}
                  onChange={(e) => setFormData({ ...formData, sourceCitation: e.target.value })}
                  placeholder={
                    formData.sourceType === "jurnal" || formData.sourceType === "buku"
                      ? "Contoh: 10.1234/abc, atau Penulis, Jurnal Hukum Tata Negara..."
                      : formData.sourceType === "berita"
                      ? "Contoh: Harian Kompas / Majalah Tempo"
                      : "Contoh: Putusan MK No. 91/PUU-XVIII/2020 / LNRI No. 12/2021"
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  {formData.sourceType === "jurnal" || formData.sourceType === "buku"
                    ? "Tautan Jurnal / Repositori / DOI:"
                    : formData.sourceType === "berita"
                    ? "Tautan Berita (Wajib Media Kredibel):"
                    : "Tautan Verifikasi Resmi (JDIH / Direktori Putusan):"}
                </label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder={
                    formData.sourceType === "berita"
                      ? "https://www.kompas.id/..."
                      : "https://putusan3.mahkamahagung.go.id/... atau jdih.setneg.go.id/..."
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                Ringkasan Fakta Hukum & Analisis Dampak Konstitusional:
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                placeholder="Uraikan secara objektif apa yang terjadi, pertimbangan majelis hakim/lembaga, dan dampaknya terhadap pelaksanaan konstitusi..."
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 3: Pemetaan ke 3 Pilar Konstitusi */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <IconScale size={18} className="text-[var(--acc-red)]" />
              <span>3. Kaitan Dimensi Konstitusional (Pilih Minimal 1)</span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="space-y-2 rounded-xl bg-[var(--bg)] p-3 border border-[var(--line)]">
                <div className="font-bold text-[#22c55e] flex items-center gap-1.5">
                  <IconShieldCheck size={14} />
                  <span>Lima Sila</span>
                </div>
                {dataset.rubric.dimensions
                  .filter((d) => d.group_id === "sila")
                  .map((dim) => (
                    <label key={dim.id} className="flex items-start gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={formData.selectedDimensions.includes(dim.id)}
                        onChange={() => toggleDimension(dim.id)}
                        className="mt-0.5 rounded"
                      />
                      <span>{dim.name_id}</span>
                    </label>
                  ))}
              </div>

              <div className="space-y-2 rounded-xl bg-[var(--bg)] p-3 border border-[var(--line)]">
                <div className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <IconInstitution size={14} />
                  <span>Pembukaan UUD</span>
                </div>
                {dataset.rubric.dimensions
                  .filter((d) => d.group_id === "pembukaan")
                  .map((dim) => (
                    <label key={dim.id} className="flex items-start gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={formData.selectedDimensions.includes(dim.id)}
                        onChange={() => toggleDimension(dim.id)}
                        className="mt-0.5 rounded"
                      />
                      <span>{dim.name_id}</span>
                    </label>
                  ))}
              </div>

              <div className="space-y-2 rounded-xl bg-[var(--bg)] p-3 border border-[var(--line)]">
                <div className="font-bold text-[#f59e0b] flex items-center gap-1.5">
                  <IconScale size={14} />
                  <span>Norma Struktural</span>
                </div>
                {dataset.rubric.dimensions
                  .filter((d) => d.group_id === "struktur-uud")
                  .map((dim) => (
                    <label key={dim.id} className="flex items-start gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={formData.selectedDimensions.includes(dim.id)}
                        onChange={() => toggleDimension(dim.id)}
                        className="mt-0.5 rounded"
                      />
                      <span>{dim.name_id}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          {/* Section 4: Identitas Pengusul (Opsional) */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>👤</span>
              <span>4. Identitas Pengusul (Opsional)</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Nama Lengkap / Inisial:
                </label>
                <input
                  type="text"
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  placeholder="Nama pengusul"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  Afiliasi / Universitas / Lembaga:
                </label>
                <input
                  type="text"
                  value={formData.submitterAffiliation}
                  onChange={(e) => setFormData({ ...formData, submitterAffiliation: e.target.value })}
                  placeholder="Contoh: FH Universitas Indonesia / Peneliti Independen"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--acc-red)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/"
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--acc-red)] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Mengirimkan..." : "Kirim Usulan Bukti →"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
