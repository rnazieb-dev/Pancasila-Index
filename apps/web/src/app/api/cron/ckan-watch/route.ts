import { NextResponse } from "next/server";
import { fetchLatestDatasets } from "@pancasila-index/core";
import { analyzeDatasetClaim } from "@pancasila-index/ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verifikasi Cron Secret jika diperlukan untuk keamanan Vercel
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const datasets = await fetchLatestDatasets();
    let added = 0;

    for (const ds of datasets) {
      // Periksa apakah dataset punya DataStore resources
      const dsResource = ds.resources.find(r => r.datastore_active);
      if (!dsResource) continue;

      // Cek duplikasi
      const existing = await prisma.ckanRadarItem.findUnique({
        where: { resourceId: dsResource.id }
      });

      if (existing) continue;

      // Analisis AI
      const analysis = await analyzeDatasetClaim(ds);
      
      await prisma.ckanRadarItem.create({
        data: {
          resourceId: dsResource.id,
          packageId: ds.id,
          title: ds.title,
          agency: ds.organization?.title || "Pemerintah",
          metadata: { notes: ds.notes, date: ds.metadata_modified },
          aiExtractedClaim: analysis?.aiExtractedClaim || "Klaim pemerintah terdeteksi.",
          relevantDimension: analysis?.relevantDimension || "sila-5",
          status: "PENDING"
        }
      });
      added++;
    }

    return NextResponse.json({ success: true, processed: datasets.length, added });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
