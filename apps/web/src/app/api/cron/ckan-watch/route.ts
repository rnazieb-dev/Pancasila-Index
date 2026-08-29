import { NextResponse } from "next/server";
import { fetchLatestDatasets } from "@pancasila-index/core";
import { analyzeDatasetClaim } from "@pancasila-index/ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    // Filter valid datasets that have at least one structured resource (datastore or csv/json)
    const validCandidates = datasets.filter(ds => {
      return ds.resources?.some(r => 
        r.datastore_active || 
        ['csv', 'xlsx', 'json'].includes((r.format || '').toLowerCase())
      );
    });

    // Proses secara paralel untuk efisiensi serverless cron
    await Promise.allSettled(
      validCandidates.map(async (ds) => {
        const targetResource = ds.resources.find(r => r.datastore_active) || ds.resources[0];
        if (!targetResource) return;

        // Cek duplikasi
        const existing = await prisma.ckanRadarItem.findUnique({
          where: { resourceId: targetResource.id }
        });

        if (existing) return;

        // Analisis AI (dengan fallback heuristik deterministik)
        const analysis = await analyzeDatasetClaim(ds);
        
        await prisma.ckanRadarItem.create({
          data: {
            resourceId: targetResource.id,
            packageId: ds.id,
            title: ds.title,
            agency: ds.organization?.title || "Pemerintah",
            metadata: { notes: ds.notes, date: ds.metadata_modified, format: targetResource.format },
            aiExtractedClaim: analysis?.aiExtractedClaim || "Klaim rilis pemerintah terdeteksi.",
            relevantDimension: analysis?.relevantDimension || "sila-5",
            status: "PENDING"
          }
        });
        added++;
      })
    );

    return NextResponse.json({ success: true, processed: validCandidates.length, added });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
