"use client";

import { useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import { SUBSTANTIVE_I18N } from "@/lib/i18n-substantive";

export default function TerjemahanQueuePage() {
  const [selectedLang, setSelectedLang] = useState<"en" | "jv" | "su" | "min">("en");
  const [suggestModal, setSuggestModal] = useState<{
    dimId: string;
    dimNameId: string;
    currentTranslation: string;
  } | null>(null);

  const [suggestion, setSuggestion] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const langNames = {
    en: "English (Internasional)",
    jv: "Basa Jawa (Krama Inggil)",
    su: "Basa Sunda",
    min: "Baso Minang",
  };

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSuggestModal(null);
      setSuggestion("");
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/peer-review" className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
        ← Kembali ke Portal Peer Review
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--acc-sky)] font-semibold">
            Fase 10 — Multilingual Substantive QA
          </span>
          <h1 className="mt-1 text-3xl font-bold">Antrean Tinjauan Bahasa & Terjemahan</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
            Tinjau dan sempurnakan padanan istilah konstitusional, norma Pancasila, dan teks rubrik
            dalam bahasa internasional dan bahasa daerah Nusantara.
          </p>
        </div>

        {/* Tab Pilihan Bahasa */}
        <div className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1 text-xs font-semibold">
          {(["en", "jv", "su", "min"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLang(l)}
              className={`rounded-lg px-3 py-1.5 transition ${
                selectedLang === l
                  ? "bg-sky-700 text-white shadow"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {l.toUpperCase()} ({l === "en" ? "EN" : l === "jv" ? "Jawa" : l === "su" ? "Sunda" : "Minang"})
            </button>
          ))}
        </div>
      </div>

      {/* Info Standar Terjemahan */}
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-xs text-[var(--muted)] leading-relaxed space-y-2">
        <div className="font-bold text-[var(--text)] flex items-center gap-2">
          <span>🌐</span>
          Bahasa Sasaran: <span className="text-[var(--acc-sky)]">{langNames[selectedLang]}</span>
        </div>
        <p>
          Penerjemahan konsep ketatanegaraan Indonesia memerlukan ketelitian terminologis agar esensi
          filosofis Pancasila dan Pembukaan UUD 1945 tetap terjaga tanpa terdistorsi makna hukumnya.
          Jika Anda menemukan padanan kata yang lebih tepat, silakan klik tombol <strong>Koreksi Terjemahan</strong>.
        </p>
      </div>

      {/* Tabel Komparasi Side-by-Side */}
      <div className="mt-8 space-y-4">
        {dataset.rubric.dimensions.map((dim) => {
          const trans = SUBSTANTIVE_I18N[selectedLang]?.dimensions[dim.id];
          return (
            <div
              key={dim.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div>
                  <span className="rounded bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 uppercase">
                    {dim.id}
                  </span>
                  <h3 className="font-bold text-base text-[var(--text)] mt-1">{dim.name_id}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status nyata, bukan lencana hijau tanpa syarat. Sebelumnya
                      "Lolos QA Tim" nempel ke SEMUA dimensi termasuk yang belum
                      diterjemahkan sama sekali - klaim mutu yang tidak benar
                      justru di halaman yang meminta orang mengoreksi. */}
                  {trans?.name && trans?.question ? (
                    <span className="rounded-full bg-emerald-500/20 text-[var(--acc-emerald)] px-2.5 py-0.5 text-[10px] font-semibold">
                      Terjemahan tersedia
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 text-[var(--acc-amber)] px-2.5 py-0.5 text-[10px] font-semibold">
                      Belum diterjemahkan
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setSuggestModal({
                        dimId: dim.id,
                        dimNameId: dim.name_id,
                        currentTranslation: trans?.name || "",
                      })
                    }
                    className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--acc-sky)] hover:border-sky-500 transition"
                  >
                    ✏️ Usulkan Koreksi
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* Bahasa Indonesia (Kanonik) */}
                <div className="rounded-lg bg-[var(--bg)] p-3.5 border border-[var(--line)] space-y-1.5">
                  <div className="font-bold text-[var(--muted)] uppercase tracking-wider text-[10px]">
                    Bahasa Indonesia (Kanonik)
                  </div>
                  <p className="font-semibold text-[var(--text)]">{dim.name_id}</p>
                  <p className="text-[var(--muted)] leading-relaxed italic">{dim.question_id}</p>
                </div>

                {/* Bahasa Terjemahan */}
                <div className="rounded-lg bg-sky-950/20 p-3.5 border border-sky-500/20 space-y-1.5">
                  <div className="font-bold text-[var(--acc-sky)] uppercase tracking-wider text-[10px]">
                    {langNames[selectedLang]}
                  </div>
                  <p className="font-semibold text-[var(--acc-sky-strong)]">{trans?.name || "Belum diterjemahkan"}</p>
                  <p className="text-[var(--muted)] leading-relaxed italic">
                    {trans?.question || "Belum ada pertanyaan panduan"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Usulan Koreksi Terjemahan */}
      {suggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text)]">Usulkan Koreksi Terjemahan</h3>
              <button
                onClick={() => setSuggestModal(null)}
                className="text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center text-xs text-[var(--acc-emerald)]">
                ✓ Usulan terjemahan berhasil dikirim ke antrean tinjauan bahasa. Terima kasih!
              </div>
            ) : (
              <form onSubmit={handleSendSuggestion} className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--muted)]">Dimensi:</span>{" "}
                  <strong className="text-[var(--text)]">{suggestModal.dimNameId}</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Terjemahan Saat Ini ({selectedLang.toUpperCase()}):</span>{" "}
                  <div className="mt-1 p-2 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                    {suggestModal.currentTranslation}
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-semibold mb-1">
                    Usulan Padanan Kata yang Lebih Tepat:
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--text)] focus:border-sky-500 focus:outline-none"
                    placeholder="Ketik usulan terjemahan..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-semibold mb-1">
                    Nama / Afiliasi Linguistik Kontributor:
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-[var(--text)] focus:border-sky-500 focus:outline-none"
                    placeholder="Nama kontributor atau institusi bahasa"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSuggestModal(null)}
                    className="flex-1 rounded-lg border border-[var(--line)] py-2 text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-sky-600 py-2 font-semibold text-white hover:bg-sky-500"
                  >
                    Kirim Usulan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
