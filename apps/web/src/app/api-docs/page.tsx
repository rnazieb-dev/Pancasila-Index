"use client";

import { useState } from "react";
import Link from "next/link";

interface EndpointDoc {
  path: string;
  method: "GET";
  summary: string;
  params?: Array<{ name: string; type: string; required?: boolean; desc: string }>;
  exampleUrl: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    path: "/api/v1/index",
    method: "GET",
    summary: "Daftar ringkas skor indeks per masa jabatan untuk seluruh organ.",
    exampleUrl: "/api/v1/index",
  },
  {
    path: "/api/v1/institutions",
    method: "GET",
    summary: "Daftar 8 organ konstitusional Republik Indonesia beserta jumlah masa jabatan.",
    params: [{ name: "branch", type: "string", desc: "Filter cabang: eksekutif, legislatif, yudikatif, eksaminatif" }],
    exampleUrl: "/api/v1/institutions?branch=yudikatif",
  },
  {
    path: "/api/v1/institutions/{slug}",
    method: "GET",
    summary: "Detail profil lembaga konstitusional dan riwayat masa jabatan lengkapnya.",
    params: [{ name: "slug", type: "string", required: true, desc: "presiden, dpr, mpr, dpd, mahkamah-konstitusi, mahkamah-agung, bpk, komisi-yudisial" }],
    exampleUrl: "/api/v1/institutions/presiden",
  },
  {
    path: "/api/v1/terms",
    method: "GET",
    summary: "Daftar masa jabatan kepemimpinan organ dengan filter era dan pencarian tokoh.",
    params: [
      { name: "institution", type: "string", desc: "ID atau slug lembaga (contoh: dpr-ri, presiden)" },
      { name: "era", type: "string", desc: "revolusi, demokrasi-terpimpin, orde-baru, reformasi" },
      { name: "q", type: "string", desc: "Pencarian nama tokoh atau label jabatan" },
    ],
    exampleUrl: "/api/v1/terms?era=reformasi",
  },
  {
    path: "/api/v1/events",
    method: "GET",
    summary: "Daftar peristiwa berbukti dengan dukungan filter dimensi, institusi, dan pagination.",
    params: [
      { name: "term", type: "string", desc: "ID masa jabatan (contoh: presiden-habibie)" },
      { name: "dimension", type: "string", desc: "ID dimensi (contoh: sila-2, negara-hukum)" },
      { name: "page", type: "integer", desc: "Nomor halaman (default: 1)" },
      { name: "limit", type: "integer", desc: "Jumlah item per halaman (max: 100, default: 50)" },
    ],
    exampleUrl: "/api/v1/events?dimension=negara-hukum&limit=10",
  },
  {
    path: "/api/v1/assessments",
    method: "GET",
    summary: "Lembar penilaian dimensi per term, rasional analisis, dan tautan bukti empiris.",
    params: [
      { name: "term", type: "string", desc: "ID masa jabatan" },
      { name: "status", type: "string", desc: "draft atau published" },
    ],
    exampleUrl: "/api/v1/assessments?status=draft",
  },
  {
    path: "/api/v1/sources",
    method: "GET",
    summary: "Daftar instrumen hukum, UU, Putusan MK/MA, TAP MPR, dan arsip primer.",
    params: [
      { name: "type", type: "string", desc: "undang-undang, putusan-mk, dokumen-mpr, dll." },
      { name: "q", type: "string", desc: "Pencarian judul atau nomor peraturan" },
    ],
    exampleUrl: "/api/v1/sources?type=undang-undang&limit=10",
  },
  {
    path: "/api/v1/compare",
    method: "GET",
    summary: "Bandingkan skor per dimensi antar beberapa periode/organ secara berdampingan.",
    params: [
      { name: "terms", type: "string", required: true, desc: "Daftar term_id dipisah koma (contoh: presiden-soeharto,presiden-habibie)" },
    ],
    exampleUrl: "/api/v1/compare?terms=presiden-soeharto,presiden-habibie,presiden-jokowi-ii",
  },
  {
    path: "/api/v1/rubric",
    method: "GET",
    summary: "Spesifikasi rubrik penilaian v1.0.0 (15 dimensi dan skala jangkar).",
    exampleUrl: "/api/v1/rubric",
  },
  {
    path: "/api/v1/uud",
    method: "GET",
    summary: "Peta 73 pasal UUD 1945 beserta keterhubungannya dengan dimensi rubrik.",
    exampleUrl: "/api/v1/uud",
  },
];

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<string>(ENDPOINTS[0]!.path);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedEndpoint = ENDPOINTS.find((e) => e.path === activeTab) ?? ENDPOINTS[0]!;

  const handleTest = async (url: string) => {
    setLoading(true);
    setTestResponse(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setTestResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      setTestResponse(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="text-3xl font-bold">Dokumentasi REST API v1</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Akses data konstitusional terstruktur melalui antarmuka OpenAPI 3.1 publik.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/v1/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] hover:border-slate-500 transition"
          >
            📄 openapi.json ↗
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar Nav Endpoints */}
        <aside className="space-y-1">
          <div className="text-xs uppercase font-bold text-[var(--muted)] px-3 py-1">
            Endpoint Publik
          </div>
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.path}
              onClick={() => {
                setActiveTab(ep.path);
                setTestResponse(null);
              }}
              className={`w-full text-left rounded-lg px-3 py-2 text-xs transition flex items-center gap-2 ${
                activeTab === ep.path
                  ? "bg-red-600 text-white font-semibold shadow"
                  : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]"
              }`}
            >
              <span className="font-mono text-[10px] font-bold uppercase bg-[var(--line)] text-[var(--text)] px-1.5 py-0.5 rounded">
                {ep.method}
              </span>
              <span className="truncate">{ep.path}</span>
            </button>
          ))}
        </aside>

        {/* Content Viewer */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-emerald-500/20 text-[var(--acc-emerald)] font-mono text-xs font-bold px-2.5 py-1">
                {selectedEndpoint.method}
              </span>
              <span className="font-mono text-base font-bold text-[var(--text)]">
                {selectedEndpoint.path}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              {selectedEndpoint.summary}
            </p>
          </div>

          {/* Parameters */}
          {selectedEndpoint.params && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Parameter Query / Path
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--bg)]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--line)] text-[var(--muted)]">
                    <tr>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Tipe</th>
                      <th className="px-3 py-2">Wajib?</th>
                      <th className="px-3 py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {selectedEndpoint.params.map((param) => (
                      <tr key={param.name}>
                        <td className="px-3 py-2 font-mono text-[var(--acc-sky)] font-semibold">{param.name}</td>
                        <td className="px-3 py-2 font-mono text-[var(--muted)]">{param.type}</td>
                        <td className="px-3 py-2">
                          {param.required ? (
                            <span className="text-[var(--acc-red)] font-bold">Ya</span>
                          ) : (
                            <span className="text-[var(--muted)]">Opsional</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[var(--muted)]">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Try it out */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Uji Coba Langsung (Interactive Test)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={selectedEndpoint.exampleUrl}
                className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--acc-sky-strong)] focus:outline-none"
              />
              <button
                onClick={() => handleTest(selectedEndpoint.exampleUrl)}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {loading ? "Memuat..." : "🚀 Kirim Request"}
              </button>
            </div>

            {testResponse && (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Response JSON (Status: 200 OK):</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(testResponse)}
                    className="hover:text-[var(--text)]"
                  >
                    Salin JSON
                  </button>
                </div>
                <pre className="max-h-80 overflow-y-auto rounded-lg border border-[var(--line)] bg-[#0a0f1d] p-4 text-xs font-mono text-[var(--acc-emerald)] leading-normal">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
