"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { datastoreSearch, CkanDatastoreResponse } from "@pancasila-index/core";

const CKAN_PRESETS = [
  { label: "Satu Data Indonesia (Nasional)", url: "https://data.go.id" },
  { label: "Open Data Jakarta", url: "https://data.jakarta.go.id" },
  { label: "Satu Data Jabar", url: "https://opendata.jabarprov.go.id" },
  { label: "Open Data Kota Bandung", url: "https://data.bandung.go.id" },
];

export default function ImportDataPage() {
  const { data: session, status: authStatus } = useSession();

  const [activeTab, setActiveTab] = useState<"explorer" | "curation">("explorer");

  // Explorer State
  const [baseUrl, setBaseUrl] = useState("https://data.go.id");
  const [resourceId, setResourceId] = useState("");
  const [tableQuery, setTableQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CkanDatastoreResponse<any> | null>(null);
  const [error, setError] = useState("");

  // Form Verifikasi
  const [contextNote, setContextNote] = useState("");
  const [relevantDimension, setRelevantDimension] = useState("sila-5");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Radar AI State
  const [radarItems, setRadarItems] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(true);

  // Antrean Kurasi State
  const [pendingAudits, setPendingAudits] = useState<any[]>([]);
  const [curationLoading, setCurationLoading] = useState(false);
  const [curationActionMsg, setCurationActionMsg] = useState("");

  const fetchRadar = () => {
    setRadarLoading(true);
    fetch('/api/kurasi/radar')
      .then(res => res.json())
      .then(d => {
        if (d.success) setRadarItems(d.items);
        setRadarLoading(false);
      })
      .catch(() => setRadarLoading(false));
  };

  const fetchPendingAudits = () => {
    setCurationLoading(true);
    fetch('/api/kurasi/ckan')
      .then(res => res.json())
      .then(d => {
        if (d.success) setPendingAudits(d.items);
        setCurationLoading(false);
      })
      .catch(() => setCurationLoading(false));
  };

  useEffect(() => {
    fetchRadar();
    if (session?.user) {
      fetchPendingAudits();
    }
  }, [session]);

  const handleSearch = async (newOffset = offset) => {
    if (!resourceId) return;
    setLoading(true);
    setError("");
    setSaveSuccess(false);
    try {
      const res = await datastoreSearch({
        baseUrl,
        resourceId,
        limit,
        offset: newOffset,
        q: tableQuery || undefined,
      });
      setData(res);
      setOffset(newOffset);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghubungi API CKAN.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!session?.user) {
      setError("Anda wajib login terlebih dahulu untuk mengirimkan usulan verifikasi.");
      return;
    }
    if (!resourceId || !contextNote.trim()) {
      setError("Catatan verifikasi independen tidak boleh kosong.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/usulan/ckan-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          baseUrl,
          title: data?.result?.resource_id ? `DataStore Resource ${data.result.resource_id}` : "Data Pemerintah CKAN",
          contextNote,
          relevantDimension
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setSaveSuccess(true);
        setContextNote("");
        fetchRadar();
        fetchPendingAudits();
      } else {
        setError(resData.error || "Gagal menyimpan usulan.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengirim data.");
    } finally {
      setSaving(false);
    }
  };

  const handleVoteAudit = async (auditId: string, decision: "approved" | "rejected") => {
    setCurationActionMsg("");
    try {
      const res = await fetch("/api/kurasi/ckan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, decision })
      });
      const d = await res.json();
      if (d.success) {
        setCurationActionMsg(d.message || "Keputusan kurasi berhasil dicatat.");
        fetchPendingAudits();
      } else {
        setCurationActionMsg(d.error || "Gagal memproses keputusan.");
      }
    } catch (e: any) {
      setCurationActionMsg(e.message);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-[var(--muted)]">
        Memeriksa sesi autentikasi Kontributor...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-sm">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold mb-2">Akses Khusus Kontributor Terverifikasi</h1>
          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
            Modul Audit Big Data CKAN dan Tinjauan Sejawat dilindungi secara ketat demi menjaga integritas akademik dan metodologis. Silakan masuk atau daftar terlebih dahulu.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/masuk"
              className="bg-[var(--text)] text-[var(--bg)] px-5 py-2.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Masuk Akun &rarr;
            </Link>
            <Link
              href="/daftar"
              className="border border-[var(--line)] text-[var(--text)] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[var(--bg)] transition-colors"
            >
              Daftar Kontributor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Audit Data Independen (CKAN DataStore)</h1>
          <p className="text-[var(--muted)] text-xs">
            Masuk sebagai: <strong className="text-[var(--text)]">{session.user.name}</strong> ({session.user.email})
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[var(--panel)] border border-[var(--line)] p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === "explorer" ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            📊 Eksplorasi & Usulkan Audit
          </button>
          <button
            onClick={() => { setActiveTab("curation"); fetchPendingAudits(); }}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "curation" ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            ⚖️ Antrean Kuorum ({pendingAudits.filter(a => a.status !== "published" && a.status !== "rejected").length})
          </button>
        </div>
      </div>

      {activeTab === "curation" ? (
        /* Tab Kuorum Kurasi */
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)] leading-relaxed">
            <strong className="text-[var(--text)]">Prinsip Kuorum Dua-Reviewer:</strong> Setiap audit data CKAN membutuhkan persetujuan dari minimal <strong>2 Kontributor berbeda</strong> sebelum dipublikasikan ke profil lembaga.
          </div>

          {curationActionMsg && (
            <div className="p-3 bg-[var(--acc-amber)]/10 border border-[var(--acc-amber)] text-[var(--text)] rounded-lg text-xs">
              {curationActionMsg}
            </div>
          )}

          {curationLoading ? (
            <div className="text-sm text-[var(--muted)] py-8 text-center">Memuat antrean usulan...</div>
          ) : pendingAudits.length === 0 ? (
            <div className="text-sm text-[var(--muted)] py-8 text-center">Tidak ada usulan audit data yang menunggu kurasi.</div>
          ) : (
            <div className="space-y-4">
              {pendingAudits.map((item) => (
                <div key={item.id} className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                        <span>Oleh: <strong>{item.contributor?.name || "Kontributor"}</strong></span>
                        <span>·</span>
                        <span className="font-mono">{new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[var(--text)] mt-0.5">{item.title}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      item.status === 'published' ? 'bg-[var(--acc-emerald)]/10 text-[var(--acc-emerald)]' :
                      item.status === 'rejected' ? 'bg-[var(--acc-red)]/10 text-[var(--acc-red)]' :
                      item.status === 'pending_second' ? 'bg-[var(--acc-amber)]/10 text-[var(--acc-amber)]' :
                      'bg-[var(--line)] text-[var(--muted)]'
                    }`}>
                      {item.status === 'pending_second' ? 'Menunggu Peninjau ke-2' : item.status}
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--bg)] rounded-lg text-xs space-y-2 border border-[var(--line)]">
                    <div className="flex gap-2">
                      <span className="text-[var(--muted)] shrink-0">Dimensi Terkait:</span>
                      <span className="font-semibold text-[var(--text)]">{item.relevantDimension}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[var(--muted)] shrink-0">Catatan Kritis:</span>
                      <span className="text-[var(--text)] leading-relaxed">{item.contextNote}</span>
                    </div>
                    <div className="text-[11px] text-[var(--muted)] font-mono truncate">
                      Sumber CKAN: <a href={`${item.baseUrl}/dataset`} target="_blank" rel="noreferrer" className="underline">{item.baseUrl}</a> (ID: {item.resourceId})
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-[11px] text-[var(--muted)]">
                      Penyetuju ({item.approverNames?.length || 0}/2): <strong className="text-[var(--text)]">{item.approverNames?.join(", ") || "Belum ada"}</strong>
                    </div>

                    {item.status !== "published" && item.status !== "rejected" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVoteAudit(item.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg border border-[var(--acc-red)] text-[var(--acc-red)] text-xs font-semibold hover:bg-[var(--acc-red)]/10"
                        >
                          Tolak Usulan
                        </button>
                        <button
                          onClick={() => handleVoteAudit(item.id, "approved")}
                          className="px-4 py-1.5 rounded-lg bg-[var(--acc-emerald)] text-white text-xs font-semibold hover:opacity-90"
                        >
                          Setujui ({item.approverNames?.length || 0}/2) &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab Explorer & Submit */
        <>
          {/* Disclaimer Metodologi */}
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">ℹ️ Catatan Metodologi:</span>
            <span>Modul CKAN DataStore dikhususkan untuk audit transparansi era digital (2014–sekarang). Era sebelumnya diaudit melalui arsip primer JDIH & korpus sejarah.</span>
          </div>

          {/* Radar AI Section */}
          <div className="mb-8 p-5 rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-[var(--acc-amber)] flex items-center gap-2">
                <span>🤖</span> Radar Audit Terkini (Deteksi AI)
              </h2>
              <button 
                onClick={fetchRadar}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline"
              >
                Segarkan Radar
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4">
              AI Watchdog memindai rilis dataset pemerintah dan memetakan klaim substantif yang memerlukan verifikasi Kontributor.
            </p>

            {radarLoading ? (
              <div className="text-xs text-[var(--muted)]">Memindai portal data...</div>
            ) : radarItems.length === 0 ? (
              <div className="text-xs text-[var(--muted)]">Belum ada dataset baru yang terdeteksi di radar.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {radarItems.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] shadow-sm flex flex-col gap-2">
                    <div className="text-xs text-[var(--muted)] flex justify-between items-center">
                      <span className="font-medium text-[var(--text)]">{item.agency}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'AUDITED' ? 'bg-[var(--acc-emerald)]/10 text-[var(--acc-emerald)]' :
                        item.status === 'IGNORED' ? 'bg-[var(--line)] text-[var(--muted)]' :
                        'bg-[var(--acc-amber)]/10 text-[var(--acc-amber)]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs leading-snug">{item.title}</h3>
                    <div className="mt-1 p-2 bg-[var(--panel)] rounded text-[11px] border-l-2 border-[var(--acc-amber)] leading-relaxed">
                      <span className="font-semibold">Klaim:</span> {item.aiExtractedClaim}
                    </div>
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-[var(--line)]">
                      <span className="text-[10px] font-mono text-[var(--muted)] truncate max-w-[120px]" title={item.resourceId}>
                        {item.resourceId}
                      </span>
                      <button 
                        onClick={() => {
                          setResourceId(item.resourceId);
                          setRelevantDimension(item.relevantDimension || "sila-5");
                          handleSearch(0);
                        }}
                        className="text-[11px] font-semibold text-[var(--acc-emerald)] hover:underline"
                      >
                        Audit Data &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4 p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Pilih Portal Preset</label>
                <select
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--text)] mb-2"
                  onChange={(e) => setBaseUrl(e.target.value)}
                  value={baseUrl}
                >
                  {CKAN_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input 
                  type="url" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--text)]"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://data.go.id"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">DataStore Resource ID</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--text)]"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  placeholder="e.g. 8d3a1f2b-9a8c-4b..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Cari di Dalam Tabel (q)</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--text)]"
                  value={tableQuery}
                  onChange={(e) => setTableQuery(e.target.value)}
                  placeholder="e.g. Papua, Beras, 2023..."
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[11px] text-[var(--muted)] mb-1">Baris per Halaman</label>
                  <select
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                  >
                    <option value={5}>5 Baris</option>
                    <option value={10}>10 Baris</option>
                    <option value={25}>25 Baris</option>
                    <option value={50}>50 Baris</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => handleSearch(0)}
                disabled={loading || !resourceId}
                className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-4 py-2.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <span>Mengunduh Baris...</span> : <span>🔍 Tarik Data</span>}
              </button>
            </div>

            <div className="md:col-span-2">
              {error && (
                <div className="p-3.5 bg-[var(--score-neg)]/10 border border-[var(--score-neg)] text-[var(--score-neg)] rounded-lg text-xs mb-4">
                  {error}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3.5 bg-[var(--acc-emerald)]/10 border border-[var(--acc-emerald)] text-[var(--acc-emerald)] rounded-lg text-xs mb-4">
                  ✅ Usulan audit berhasil dikirim ke antrean <strong>Kuorum Dua-Reviewer</strong>!
                </div>
              )}

              {data && data.success && data.result && (
                <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <span>🗄️</span>
                      Data Resmi ({data.result.total} Total Baris)
                    </h3>
                    <span className="text-[11px] text-[var(--muted)] border border-[var(--line)] px-2 py-0.5 rounded-md">
                      Menampilkan baris {offset + 1}–{Math.min(offset + limit, data.result.total)}
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-lg border border-[var(--line)] max-h-72">
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="bg-[var(--bg)] sticky top-0">
                        <tr>
                          {data.result.fields.map(f => (
                            <th key={f.id} className="px-3 py-2 border-b border-[var(--line)] font-semibold text-[var(--text)]">
                              {f.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.result.records.map((r, i) => (
                          <tr key={i} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg)]/50">
                            {data.result!.fields.map(f => (
                              <td key={f.id} className="px-3 py-2 text-[var(--muted)]">
                                {String(r[f.id] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginasi Controls */}
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <button
                      disabled={offset === 0 || loading}
                      onClick={() => handleSearch(Math.max(0, offset - limit))}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-md hover:bg-[var(--bg)] disabled:opacity-40"
                    >
                      &larr; Halaman Sebelumnya
                    </button>
                    <span className="text-[var(--muted)] text-[11px]">
                      Offset: {offset}
                    </span>
                    <button
                      disabled={offset + limit >= data.result.total || loading}
                      onClick={() => handleSearch(offset + limit)}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-md hover:bg-[var(--bg)] disabled:opacity-40"
                    >
                      Halaman Selanjutnya &rarr;
                    </button>
                  </div>

                  {/* Form Penyematan Verifikasi Independen */}
                  <div className="mt-6 pt-4 border-t border-[var(--line)] space-y-3">
                    <h4 className="font-semibold text-xs uppercase tracking-wide text-[var(--text)]">
                      Sisipkan Konteks / Verifikasi Independen
                    </h4>
                    
                    <div>
                      <label className="block text-[11px] text-[var(--muted)] mb-1">Dimensi UUD 1945 yang Bersinggungan</label>
                      <select
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--text)]"
                        value={relevantDimension}
                        onChange={(e) => setRelevantDimension(e.target.value)}
                      >
                        <option value="sila-1">Sila 1: Ketuhanan Yang Maha Esa</option>
                        <option value="sila-2">Sila 2: Kemanusiaan yang Adil dan Beradab</option>
                        <option value="sila-3">Sila 3: Persatuan Indonesia</option>
                        <option value="sila-4">Sila 4: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan</option>
                        <option value="sila-5">Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia</option>
                        <option value="negara-hukum">Pilar III: Negara Hukum (Pasal 1(3))</option>
                        <option value="checks-balances">Pilar III: Checks & Balances</option>
                        <option value="kedaulatan-rakyat">Pilar III: Kedaulatan Rakyat (Pasal 1(2))</option>
                        <option value="tujuan-1">Pilar II: Melindungi Segenap Bangsa</option>
                        <option value="tujuan-2">Pilar II: Memajukan Kesejahteraan Umum</option>
                        <option value="tujuan-3">Pilar II: Mencerdaskan Kehidupan Bangsa</option>
                        <option value="tujuan-4">Pilar II: Ikut Melaksanakan Ketertiban Dunia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[var(--muted)] mb-1">Catatan Audit & Argumentasi Kritis</label>
                      <textarea 
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--text)] min-h-[90px]"
                        placeholder="Beri catatan kritis berbasis bukti. Misalnya: 'Data penurunan angka kemiskinan ini menggunakan garis kemiskinan ekstrem yang sangat rendah dan mengabaikan lonjakan harga beras...'"
                        value={contextNote}
                        onChange={(e) => setContextNote(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveAudit}
                        disabled={saving || !contextNote.trim()}
                        className="bg-[var(--acc-emerald)] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity text-xs disabled:opacity-50"
                      >
                        {saving ? "Mengirim ke Antrean Kurasi..." : "Kirim Usulan Verifikasi"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
