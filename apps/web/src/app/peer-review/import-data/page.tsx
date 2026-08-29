"use client";

import { useState, useEffect } from "react";
import { datastoreSearch, CkanDatastoreResponse } from "@pancasila-index/core";

const CKAN_PRESETS = [
  { label: "Satu Data Indonesia (Nasional)", url: "https://data.go.id" },
  { label: "Open Data Jakarta", url: "https://data.jakarta.go.id" },
  { label: "Satu Data Jabar", url: "https://opendata.jabarprov.go.id" },
  { label: "Open Data Kota Bandung", url: "https://data.bandung.go.id" },
];

export default function ImportDataPage() {
  const [baseUrl, setBaseUrl] = useState("https://data.go.id");
  const [resourceId, setResourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CkanDatastoreResponse<any> | null>(null);
  const [error, setError] = useState("");

  // Form Verifikasi
  const [contextNote, setContextNote] = useState("");
  const [relevantDimension, setRelevantDimension] = useState("sila-5");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Radar AI
  const [radarItems, setRadarItems] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(true);

  const fetchRadar = () => {
    setRadarLoading(true);
    fetch('/api/kurasi/radar')
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setRadarItems(d.items);
        }
        setRadarLoading(false);
      })
      .catch(() => setRadarLoading(false));
  };

  useEffect(() => {
    fetchRadar();
  }, []);

  const handleSearch = async () => {
    if (!resourceId) return;
    setLoading(true);
    setError("");
    setData(null);
    setSaveSuccess(false);
    try {
      const res = await datastoreSearch({
        baseUrl,
        resourceId,
        limit: 5,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghubungi API CKAN.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudit = async () => {
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
        fetchRadar(); // Refresh radar status
      } else {
        setError(resData.error || "Gagal menyimpan usulan.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengirim data.");
    } finally {
      setSaving(false);
    }
  };

  const handleIgnoreRadar = async (rId: string) => {
    try {
      await fetch("/api/kurasi/radar/ignore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: rId })
      });
      fetchRadar();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Audit Data Independen (CKAN DataStore)</h1>
        <p className="text-[var(--muted)] text-sm">
          Tarik Big Data dari portal pemerintah secara terstruktur. Verifikasi data resmi dan sandingkan dengan konteks independen 12 Dimensi Konstitusi.
        </p>

        {/* P2: Metodologis / Batasan Temporal */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">ℹ️ Catatan Metodologi:</span>
          <span>Modul CKAN DataStore dikhususkan untuk audit transparansi era digital (2014–sekarang). Era sebelumnya diaudit melalui arsip primer JDIH & korpus sejarah.</span>
        </div>
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
                  <div className="flex gap-2">
                    {item.status === 'PENDING' && (
                      <button 
                        onClick={() => handleIgnoreRadar(item.resourceId)}
                        className="text-[11px] text-[var(--muted)] hover:text-[var(--acc-red)]"
                      >
                        Abaikan
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setResourceId(item.resourceId);
                        setRelevantDimension(item.relevantDimension || "sila-5");
                      }}
                      className="text-[11px] font-semibold text-[var(--acc-emerald)] hover:underline"
                    >
                      Audit Data &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Pilih Portal Preset (P3)</label>
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

          <button 
            onClick={handleSearch}
            disabled={loading || !resourceId}
            className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-4 py-2.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <span>Mengunduh Baris...</span> : <span>🔍 Tarik Pratinjau Tabel</span>}
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
              ✅ Catatan verifikasi independen berhasil dicatat dan masuk ke antrean kurasi dua-reviewer!
            </div>
          )}

          {data && data.success && data.result && (
            <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>🗄️</span>
                  Data Resmi ({data.result.total} Total Baris)
                </h3>
                <span className="text-[11px] text-[var(--muted)] border border-[var(--line)] px-2 py-0.5 rounded-md">
                  Pratinjau {data.result.records.length} teratas
                </span>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-[var(--line)] max-h-80">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-[var(--bg)] sticky top-0">
                    <tr>
                      {data.result.fields.map(f => (
                        <th key={f.id} className="px-3.5 py-2 border-b border-[var(--line)] font-semibold text-[var(--text)]">
                          {f.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.result.records.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg)]/50">
                        {data.result!.fields.map(f => (
                          <td key={f.id} className="px-3.5 py-2 text-[var(--muted)]">
                            {String(r[f.id] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Form Penyematan Verifikasi Independen (P0) */}
              <div className="mt-6 pt-4 border-t border-[var(--line)] space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wide text-[var(--text)]">
                  Sisipkan Konteks / Verifikasi Independen (Pancasila Index)
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
                    {saving ? "Menyimpan ke Antrean Kurasi..." : "Simpan & Publikasikan Verifikasi"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
