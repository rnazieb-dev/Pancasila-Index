import { NextResponse } from "next/server";

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Pancasila Index API",
      version: "1.0.0",
      description:
        "REST API publik untuk mengakses data penilaian 8 organ konstitusional Republik Indonesia, peristiwa berbukti primer, dan pemetaan norma UUD 1945.",
      license: {
        name: "CC BY-SA 4.0 & AGPL-3.0",
        url: "https://creativecommons.org/licenses/by-sa/4.0/",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    paths: {
      "/api/v1/index": {
        get: {
          summary: "Daftar indeks ringkas per masa jabatan",
          responses: {
            "200": { description: "Sukses mengembalikan daftar skor indeks" },
          },
        },
      },
      "/api/v1/institutions": {
        get: {
          summary: "Daftar 8 lembaga konstitusional",
          parameters: [
            {
              name: "branch",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["eksekutif", "legislatif", "yudikatif", "eksaminatif"] },
              description: "Filter cabang kekuasaan",
            },
          ],
          responses: {
            "200": { description: "Daftar lembaga negara" },
          },
        },
      },
      "/api/v1/institutions/{slug}": {
        get: {
          summary: "Detail profil lembaga beserta masa jabatannya",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Slug lembaga (presiden, dpr, mpr, dpd, mahkamah-konstitusi, mahkamah-agung, bpk, komisi-yudisial)",
            },
          ],
          responses: {
            "200": { description: "Detail lembaga" },
            "404": { description: "Lembaga tidak ditemukan" },
          },
        },
      },
      "/api/v1/terms": {
        get: {
          summary: "Daftar masa jabatan kepemimpinan organ",
          parameters: [
            { name: "institution", in: "query", schema: { type: "string" } },
            { name: "era", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Daftar terms" } },
        },
      },
      "/api/v1/events": {
        get: {
          summary: "Daftar peristiwa berbukti dengan filter dan pagination",
          parameters: [
            { name: "term", in: "query", schema: { type: "string" } },
            { name: "institution", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "dimension", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          ],
          responses: { "200": { description: "Daftar peristiwa terpaginasi" } },
        },
      },
      "/api/v1/assessments": {
        get: {
          summary: "Daftar lembar penilaian dimensi dan rasional bukti",
          parameters: [
            { name: "term", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published"] } },
          ],
          responses: { "200": { description: "Daftar lembar penilaian" } },
        },
      },
      "/api/v1/sources": {
        get: {
          summary: "Daftar instrumen hukum dan sumber primer",
          parameters: [
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          ],
          responses: { "200": { description: "Daftar sumber primer" } },
        },
      },
      "/api/v1/compare": {
        get: {
          summary: "Komparasi skor antar-periode/organ",
          parameters: [
            {
              name: "terms",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Daftar ID term dipisah koma (misal: presiden-habibie,presiden-gusdur)",
            },
          ],
          responses: { "200": { description: "Hasil perbandingan dimensi" } },
        },
      },
      "/api/v1/rubric": {
        get: {
          summary: "Spesifikasi rubrik penilaian v1.0.0 (15 dimensi & jangkar skala)",
          responses: { "200": { description: "Objek rubrik penilaian" } },
        },
      },
      "/api/v1/uud": {
        get: {
          summary: "Peta 73 pasal UUD 1945 terhubung ke dimensi rubrik",
          responses: { "200": { description: "Peta pasal UUD" } },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
