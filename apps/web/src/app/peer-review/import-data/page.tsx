"use client";

import { useState } from "react";
import { datastoreSearch, CkanDatastoreResponse } from "@pancasila-index/core";

export default function ImportDataPage() {
  const [baseUrl, setBaseUrl] = useState("https://data.go.id");
  const [resourceId, setResourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CkanDatastoreResponse<any> | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!resourceId) return;
    setLoading(true);
    setError("");
    setData(null);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Data Independen (CKAN Import)</h1>
        <p className="text-[var(--muted)]">
          Tarik Big Data dari portal pemerintah (Satu Data Indonesia, Open Data Jakarta, dll) 
          yang menggunakan ekstensi CKAN DataStore. Verifikasi data resmi dan sandingkan dengan konteks independen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div>
            <label className="block text-sm font-medium mb-1">CKAN Base URL</label>
            <input 
              type="url" 
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--text)]"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://data.go.id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Resource ID</label>
            <input 
              type="text" 
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--text)]"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="e.g. 8d3a1f2b-..."
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !resourceId}
            className="w-full flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <span>...</span> : <span>🔍</span>}
            Pratinjau Data
          </button>
        </div>

        <div className="md:col-span-2">
          {error && (
            <div className="p-4 bg-[var(--score-neg)]/10 border border-[var(--score-neg)] text-[var(--score-neg)] rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {data && data.success && data.result && (
            <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <span>🗄️</span>
                  Data Resmi ({data.result.total} Baris)
                </h3>
                <span className="text-xs text-[var(--muted)] border border-[var(--line)] px-2 py-1 rounded-md">
                  Pratinjau {data.result.records.length} teratas
                </span>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-[var(--line)] max-h-96">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[var(--bg)] sticky top-0">
                    <tr>
                      {data.result.fields.map(f => (
                        <th key={f.id} className="px-4 py-2 border-b border-[var(--line)] font-semibold text-[var(--text)]">
                          {f.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.result.records.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg)]/50">
                        {data.result!.fields.map(f => (
                          <td key={f.id} className="px-4 py-2 text-[var(--muted)]">
                            {String(r[f.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <h4 className="font-semibold mb-2">Sisipkan Konteks / Verifikasi Independen</h4>
                <textarea 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--text)] min-h-[100px]"
                  placeholder="Beri catatan kritis berdasarkan 12 Dimensi UUD 1945. Misalnya: 'Data pertumbuhan ini tidak merefleksikan keadilan sosial (Sila 5)...'"
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button className="bg-[var(--acc-emerald)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                    Simpan & Publikasikan Verifikasi
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
