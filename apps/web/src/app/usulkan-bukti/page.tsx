"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import {
  getUserDraft,
  saveUserDraft,
  deleteUserDraft,
  getUserDrafts,
  type UserDraft,
} from "@/lib/user-drafts";

type Step = "form" | "deklarasi" | "konfirmasi" | "terkirim";

function UsulanForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftIdParam = searchParams.get("draftId");

  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftIdParam);
  const [step, setStep] = useState<Step>("form");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState<number>(0);

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

  // Muat draft jika ada parameter draftId
  useEffect(() => {
    const all = getUserDrafts();
    setDraftCount(all.length);

    if (draftIdParam) {
      const d = getUserDraft(draftIdParam);
      if (d) {
        setFormData({
          institution_id: d.institution_id,
          term_id: d.term_id,
          dimension_id: d.dimension_id,
          source_type: d.source_type,
          source_title: d.source_title,
          source_url: d.source_url,
          argumentasi: d.argumentasi,
          nama: d.nama,
          afiliasi: d.afiliasi,
          jabatan: d.jabatan,
          funding: d.funding,
          setuju_pakta: d.setuju_pakta,
        });
        setStep(d.step || "form");
        setCurrentDraftId(d.id);
      }
    }
  }, [draftIdParam]);

  // Fungsi simpan draft manual / otomatis
  const handleSaveDraft = (overrideStep?: "form" | "deklarasi" | "konfirmasi") => {
    const savedStep = overrideStep || (step === "terkirim" ? "form" : step);
    const saved = saveUserDraft({
      id: currentDraftId || undefined,
      ...formData,
      step: savedStep,
    });
    setCurrentDraftId(saved.id);
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setSaveStatus(`💾 Draf tersimpan otomatis pukul ${now}`);
    setDraftCount(getUserDrafts().length);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const availableTerms = formData.institution_id
    ? dataset.terms.filter((t) => t.institution_id === formData.institution_id)
    : [];

  const handleSubmit = async () => {
    try {
      await fetch("/api/usulan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      // Hapus draf yang sudah berhasil dikirim
      if (currentDraftId) {
        deleteUserDraft(currentDraftId);
      }
      setStep("terkirim");
    } catch {
      if (currentDraftId) {
        deleteUserDraft(currentDraftId);
      }
      setStep("terkirim");
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
          <strong className="text-[var(--acc-amber-strong)]">Under Review</strong> dan akan ditinjau oleh Dewan
          Editorial dalam 5–14 hari kerja. Draf lokal Anda telah diarsipkan.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/peer-review"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition"
          >
            Kembali ke Portal Peer Review
          </Link>
          <Link
            href="/peer-review/draf"
            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
          >
            Lihat Draf Lainnya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/peer-review" className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
          ← Kembali ke Portal Peer Review
        </Link>
        <Link
          href="/peer-review/draf"
          className="text-xs text-[var(--acc-amber)] hover:text-[var(--acc-amber-strong)] flex items-center gap-1 font-semibold"
        >
          📁 Draf Saya ({draftCount})
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Formulir Usulan Bukti & Koreksi</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Usulkan bukti primer baru atau ajukan koreksi skor penilaian konstitusi.
          </p>
        </div>

        {/* Tombol Simpan Draf Cepat */}
        <button
          type="button"
          onClick={() => handleSaveDraft()}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-[var(--acc-amber-strong)] hover:bg-amber-500/20 transition flex items-center gap-1.5"
        >
          💾 Simpan Draf
        </button>
      </div>

      {saveStatus && (
        <div className="mt-3 text-xs text-[var(--acc-emerald)] bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5 animate-fadeIn">
          {saveStatus}
        </div>
      )}

      {/* Indikator Langkah */}
      <div className="mt-6 flex items-center gap-2 text-xs">
        {(["form", "deklarasi", "konfirmasi"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                step === s
                  ? "bg-red-600 text-white"
                  : ["form", "deklarasi", "konfirmasi"].indexOf(step) > i
                  ? "bg-emerald-500/30 text-[var(--acc-emerald-strong)]"
                  : "bg-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? "text-[var(--text)] font-semibold" : "text-[var(--muted)]"}>
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
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--text)]">Langkah 1: Data Usulan</h2>
              {currentDraftId && (
                <span className="text-[11px] text-[var(--acc-amber)] font-mono">
                  [Mengedit Draf #{currentDraftId.slice(-6)}]
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Lembaga Negara</label>
                <select
                  className={inputCls}
                  value={formData.institution_id}
                  onChange={(e) => {
                    setFormData({ ...formData, institution_id: e.target.value, term_id: "" });
                  }}
                >
                  <option value="">— Pilih Lembaga —</option>
                  {dataset.institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name_id}
                    </option>
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
                    <option key={t.id} value={t.id}>
                      {t.label_id}
                    </option>
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
                  <option key={d.id} value={d.id}>
                    {d.name_id}
                  </option>
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
              <label className={labelCls}>Argumentasi Normatif & Fakta Hukum</label>
              <textarea
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder="Jelaskan bagaimana dokumen ini mendukung atau mengkoreksi penilaian dimensi terkait, beserta pasal/ketentuan yang relevan..."
                value={formData.argumentasi}
                onChange={(e) => setFormData({ ...formData, argumentasi: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
              >
                💾 Simpan Draf
              </button>
              <button
                disabled={
                  !formData.institution_id ||
                  !formData.term_id ||
                  !formData.dimension_id ||
                  !formData.source_url ||
                  !formData.argumentasi
                }
                onClick={() => {
                  handleSaveDraft("deklarasi");
                  setStep("deklarasi");
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lanjut ke Deklarasi Transparansi →
              </button>
            </div>
          </div>
        )}

        {/* ── LANGKAH 2: Deklarasi Transparansi ── */}
        {step === "deklarasi" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[var(--text)]">Langkah 2: Deklarasi Transparansi</h2>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                Informasi ini akan dipublikasikan secara terbuka bersama usulan Anda sesuai standar
                COPE (Committee on Publication Ethics).
              </p>
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
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-red-500"
                checked={formData.setuju_pakta}
                onChange={(e) => setFormData({ ...formData, setuju_pakta: e.target.checked })}
              />
              <span className="text-xs text-[var(--muted)] leading-relaxed group-hover:text-[var(--text)] transition">
                Saya menyatakan bahwa informasi di atas adalah benar, tidak memiliki konflik
                kepentingan terselubung, dan bersedia mematuhi Pakta Integritas yang akan
                dipublikasikan.
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
              >
                💾 Simpan Draf
              </button>
              <button
                disabled={
                  !formData.nama ||
                  !formData.afiliasi ||
                  !formData.funding ||
                  !formData.setuju_pakta
                }
                onClick={() => {
                  handleSaveDraft("konfirmasi");
                  setStep("konfirmasi");
                }}
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
            <h2 className="font-bold text-[var(--text)]">Langkah 3: Konfirmasi Usulan</h2>
            <p className="text-xs text-[var(--muted)]">
              Periksa kembali ringkasan usulan Anda sebelum dikirimkan ke Dewan Editorial.
            </p>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[var(--muted)]">Lembaga:</span>
                  <br />
                  <strong>
                    {dataset.institutions.find((i) => i.id === formData.institution_id)?.name_id}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Periode:</span>
                  <br />
                  <strong>
                    {dataset.terms.find((t) => t.id === formData.term_id)?.label_id}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Dimensi:</span>
                  <br />
                  <strong>
                    {dataset.rubric.dimensions.find((d) => d.id === formData.dimension_id)?.name_id}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Jenis Sumber:</span>
                  <br />
                  <strong>{formData.source_type}</strong>
                </div>
              </div>
              <div>
                <span className="text-[var(--muted)]">Sumber:</span>
                <br />
                <strong>{formData.source_title}</strong>
                <br />
                <a
                  href={formData.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--acc-sky)] text-[11px]"
                >
                  {formData.source_url} ↗
                </a>
              </div>
              <div>
                <span className="text-[var(--muted)]">Argumentasi:</span>
                <br />
                <span className="whitespace-pre-wrap">{formData.argumentasi}</span>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <span className="text-[var(--muted)]">Kontributor:</span>
                <br />
                <strong>{formData.nama}</strong> — {formData.jabatan}, {formData.afiliasi}
                <br />
                <span className="text-[var(--muted)]">Funding: </span>
                {formData.funding}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("deklarasi")}
                className="rounded-lg border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                ✓ Kirim Usulan Resmi ke Dewan Editorial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsulanPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-20 text-center text-xs text-[var(--muted)]">
          Memuat formulir usulan...
        </div>
      }
    >
      <UsulanForm />
    </Suspense>
  );
}
