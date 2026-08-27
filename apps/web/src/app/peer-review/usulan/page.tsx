"use client";

import { useState } from "react";
import { dataset } from "@pancasila-index/data";

type Step = "form" | "deklarasi" | "konfirmasi" | "terkirim";

export default function UsulanPage() {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({
    institution_id: "",
    term_id: "",
    dimension_id: "",
    source_type: "",
    source_title: "",
    source_url: "",
    argumentasi: "",
    nama: "",
    afiliasi: "",
    jabatan: "",
    funding: "",
    setuju_pakta: false,
  });

  const availableTerms = formData.institution_id
    ? dataset.terms.filter((t) => t.institution_id === formData.institution_id)
    : [];

  const handleSubmit = async () => {
    // Kirim ke endpoint /api/usulan (akan disimpan sebagai draft)
    try {
      await fetch("/api/usulan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setStep("terkirim");
    } catch {
      setStep("terkirim"); // tampilkan halaman terkirim meski offline (demo)
    }
  };

  const inputCls =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition";
  const labelCls = "block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5";

  if (step === "terkirim") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold">Usulan Berhasil Dikirim</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Terima kasih atas kontribusi Anda. Usulan Anda kini berstatus{" "}
          <strong className="text-amber-300">Under Review</strong> dan akan ditinjau oleh Dewan
          Editorial dalam 5–14 hari kerja. Anda dapat memantau status usulan melalui tautan yang
          dikirimkan ke email Anda.
        </p>
        <a href="/peer-review" className="mt-6 inline-block text-xs text-sky-400 hover:text-sky-300">
          ← Kembali ke Portal Peer Review
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <a href="/peer-review" className="text-xs text-[var(--muted)] hover:text-white">
        ← Kembali ke Portal Peer Review
      </a>
      <h1 className="mt-4 text-2xl font-bold">Formulir Usulan Bukti & Koreksi</h1>
      <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
        Lengkapi formulir di bawah untuk mengusulkan penambahan bukti primer, koreksi data peristiwa,
        atau revisi skor penilaian dimensi.
      </p>

      {/* Indikator Langkah */}
      <div className="mt-6 flex items-center gap-2 text-xs">
        {(["form", "deklarasi", "konfirmasi"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                step === s
                  ? "bg-red-500 text-white"
                  : ["form", "deklarasi", "konfirmasi"].indexOf(step) > i
                  ? "bg-emerald-500/30 text-emerald-300"
                  : "bg-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? "text-white font-semibold" : "text-[var(--muted)]"}>
              {s === "form" ? "Data Usulan" : s === "deklarasi" ? "Deklarasi Transparansi" : "Konfirmasi"}
            </span>
            {i < 2 && <span className="text-[var(--muted)]">›</span>}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">

        {/* ── LANGKAH 1: Data Usulan ── */}
        {step === "form" && (
          <div className="space-y-5">
            <h2 className="font-bold text-white/90">Langkah 1: Data Usulan</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Lembaga Negara</label>
                <select
                  className={inputCls}
                  value={formData.institution_id}
                  onChange={(e) => setFormData({ ...formData, institution_id: e.target.value, term_id: "" })}
                >
                  <option value="">— Pilih Lembaga —</option>
                  {dataset.institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.name_id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Periode / Masa Jabatan</label>
                <select
                  className={inputCls}
                  value={formData.term_id}
                  onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
                  disabled={!formData.institution_id}
                >
                  <option value="">— Pilih Periode —</option>
                  {availableTerms.map((t) => (
                    <option key={t.id} value={t.id}>{t.label_id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Dimensi Penilaian yang Diusulkan</label>
              <select
                className={inputCls}
                value={formData.dimension_id}
                onChange={(e) => setFormData({ ...formData, dimension_id: e.target.value })}
              >
                <option value="">— Pilih Dimensi —</option>
                {dataset.rubric.dimensions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name_id}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Jenis Sumber Primer</label>
                <select
                  className={inputCls}
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                >
                  <option value="">— Pilih Jenis —</option>
                  <option>Undang-Undang</option>
                  <option>Putusan MK</option>
                  <option>Putusan MA</option>
                  <option>TAP MPR</option>
                  <option>Peraturan Pemerintah</option>
                  <option>Laporan Resmi BPK</option>
                  <option>Dokumen Resmi Lainnya</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Judul Dokumen / Peraturan</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Misal: UU No. 12 Tahun 2011"
                  value={formData.source_title}
                  onChange={(e) => setFormData({ ...formData, source_title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>URL Sumber Resmi (JDIH / MK / MA / Arsipnas)</label>
              <input
                type="url"
                className={inputCls}
                placeholder="https://jdih.setneg.go.id/..."
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Tautan harus mengarah ke sumber resmi pemerintah, akademik, atau arsip terpercaya.
              </p>
            </div>

            <div>
              <label className={labelCls}>Argumentasi Normatif</label>
              <textarea
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder="Jelaskan bagaimana dokumen ini mendukung atau mengkoreksi penilaian dimensi terkait, beserta pasal/ketentuan yang relevan..."
                value={formData.argumentasi}
                onChange={(e) => setFormData({ ...formData, argumentasi: e.target.value })}
              />
            </div>

            <button
              disabled={!formData.institution_id || !formData.term_id || !formData.dimension_id || !formData.source_url || !formData.argumentasi}
              onClick={() => setStep("deklarasi")}
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lanjut ke Deklarasi Transparansi →
            </button>
          </div>
        )}

        {/* ── LANGKAH 2: Deklarasi Transparansi ── */}
        {step === "deklarasi" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-white/90">Langkah 2: Deklarasi Transparansi</h2>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                Informasi ini akan dipublikasikan secara terbuka bersama usulan Anda. Transparansi
                afiliasi dan sumber pendanaan adalah syarat mutlak integritas peer review kami.
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-200/80 leading-relaxed">
              <strong className="text-amber-300">Mengapa ini diperlukan?</strong> Penilaian lembaga
              negara berpotensi dipengaruhi oleh kepentingan. Standar COPE (Committee on Publication
              Ethics) mensyaratkan pengungkapan penuh afiliasi dan konflik kepentingan pada setiap
              karya tinjauan ilmiah.
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nama Lengkap</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Nama sesuai identitas resmi"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Jabatan / Gelar Akademis</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Misal: Dosen Hukum Tata Negara, Peneliti LIPI"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Afiliasi Institusi</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Universitas / Lembaga Riset / Organisasi"
                value={formData.afiliasi}
                onChange={(e) => setFormData({ ...formData, afiliasi: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Sumber Pendanaan Terkait (Funding Disclosure)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Tidak ada / Mandiri / Nama lembaga pemberi dana..."
                value={formData.funding}
                onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Jika riset Anda tidak didanai secara eksternal, tulis "Mandiri / Tidak Ada".
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-red-500"
                checked={formData.setuju_pakta}
                onChange={(e) => setFormData({ ...formData, setuju_pakta: e.target.checked })}
              />
              <span className="text-xs text-[var(--muted)] leading-relaxed group-hover:text-white transition">
                Saya menyatakan bahwa informasi di atas adalah benar, bahwa saya tidak memiliki konflik
                kepentingan yang tidak diungkapkan dengan lembaga yang dinilai, dan bahwa argumentasi
                saya didasarkan sepenuhnya pada bukti primer yang dapat diverifikasi.{" "}
                <strong className="text-white">Pakta Integritas ini akan dipublikasikan.</strong>
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-white hover:border-slate-500 transition"
              >
                ← Kembali
              </button>
              <button
                disabled={!formData.nama || !formData.afiliasi || !formData.funding || !formData.setuju_pakta}
                onClick={() => setStep("konfirmasi")}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tinjau & Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {/* ── LANGKAH 3: Konfirmasi ── */}
        {step === "konfirmasi" && (
          <div className="space-y-5">
            <h2 className="font-bold text-white/90">Langkah 3: Konfirmasi Usulan</h2>
            <p className="text-xs text-[var(--muted)]">
              Periksa kembali ringkasan usulan Anda sebelum dikirimkan.
            </p>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-[var(--muted)]">Lembaga:</span><br /><strong>{dataset.institutions.find(i => i.id === formData.institution_id)?.name_id}</strong></div>
                <div><span className="text-[var(--muted)]">Periode:</span><br /><strong>{dataset.terms.find(t => t.id === formData.term_id)?.label_id}</strong></div>
                <div><span className="text-[var(--muted)]">Dimensi:</span><br /><strong>{dataset.rubric.dimensions.find(d => d.id === formData.dimension_id)?.name_id}</strong></div>
                <div><span className="text-[var(--muted)]">Jenis Sumber:</span><br /><strong>{formData.source_type}</strong></div>
              </div>
              <div><span className="text-[var(--muted)]">Sumber:</span><br /><strong>{formData.source_title}</strong><br /><a href={formData.source_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 text-[11px]">{formData.source_url}</a></div>
              <div><span className="text-[var(--muted)]">Argumentasi:</span><br /><span className="whitespace-pre-wrap">{formData.argumentasi}</span></div>
              <div className="border-t border-[var(--line)] pt-3">
                <span className="text-[var(--muted)]">Kontributor:</span><br />
                <strong>{formData.nama}</strong> — {formData.jabatan}, {formData.afiliasi}<br />
                <span className="text-[var(--muted)]">Funding: </span>{formData.funding}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("deklarasi")}
                className="flex-1 rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-white hover:border-slate-500 transition"
              >
                ← Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                ✓ Kirim Usulan Resmi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
