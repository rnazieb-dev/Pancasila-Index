import { NextResponse } from "next/server";

import { dataset } from "@pancasila-index/data";

/**
 * GET /api/v1/uud — peta lengkap UUD NRI 1945 satu naskah amandemen.
 * Setiap pasal menyertakan dimensi rubrik yang mengoperasionalkannya.
 */
export function GET() {
  const pasal = dataset.uud.babs.flatMap((bab) =>
    bab.pasal.map((p) => ({
      bab: bab.nomor,
      bab_nama: bab.nama_id,
      pasal: p.nomor,
      ringkas: p.ringkas_id,
      dimensi: p.dimension_ids,
    }))
  );

  return NextResponse.json({
    title: dataset.uud.title_id,
    license: "CC-BY-SA-4.0",
    catatan: "Ringkasan navigasi; teks resmi milik MPR RI.",
    statistik: {
      bab: dataset.uud.babs.length,
      pasal: pasal.length,
      terpetakan_ke_dimensi: pasal.filter((p) => p.dimensi.length > 0).length,
    },
    pasal,
  });
}
