import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { listUsulanBy } from "@/lib/usulan-store";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let usulanList: Array<{
    id: string;
    targetType: string;
    targetId: string;
    decision: string;
    notes: string | null;
    status: "pending_review" | "pending_second" | "published" | "rejected";
    approversCount: number;
    createdAt: string;
  }> = [];

  if (session.user.id) {
    const [reviews, ckanAudits, usulan] = await Promise.all([
      // Query DB dibungkus catch agar kegagalan koneksi (DATABASE_URL belum
      // aktif) tidak mematikan sumber lain — tiap sumber fallback mandiri.
      db.review
        .findMany({
          where: { reviewerId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        })
        .catch(() => []),
      db.ckanAudit
        .findMany({
          where: { contributorId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        })
        .catch(() => []),
      listUsulanBy(
        session.user.email || session.user.name || "kontributor",
        session.user.id,
      ),
    ]);

    const usulanItems = usulan.map((u) => {
        const status: "pending_review" | "pending_second" | "published" | "rejected" =
          u.status === "PUBLISHED"
            ? "published"
            : u.status === "PENDING_SECOND"
              ? "pending_second"
              : u.status === "REJECTED"
                ? "rejected"
                : "pending_review";

        return {
          id: u.publicId || u.id,
          targetType: "Usulan Bukti Primer",
          targetId: u.publicId,
          decision: String(u.status),
          notes: u.argumentasi?.slice(0, 220) || null,
          status,
          approversCount: u.reviewerNames?.length || 0,
          createdAt: u.createdAt,
        };
      });

      const reviewItems = reviews.map((r) => {
        const isApproved = r.decision === "APPROVED";
        const status: "pending_review" | "pending_second" | "published" | "rejected" =
          isApproved ? "published" : "rejected";

        return {
          id: r.id,
          targetType: "Asesmen Masa Jabatan",
          targetId: r.assessmentId,
          decision: String(r.decision),
          notes: r.note,
          status,
          approversCount: isApproved ? 2 : 1,
          createdAt: r.createdAt.toISOString(),
        };
      });

      const ckanItems = ckanAudits.map((a) => {
        let status: "pending_review" | "pending_second" | "published" | "rejected" = "pending_review";
        if (a.status === "published") status = "published";
        else if (a.status === "pending_second") status = "pending_second";
        else if (a.status === "rejected") status = "rejected";

        return {
          id: a.id,
          targetType: "Audit Dataset CKAN",
          targetId: a.title,
          decision: a.status.toUpperCase(),
          notes: a.contextNote,
          status,
          approversCount: a.approverNames.length,
          createdAt: a.createdAt.toISOString(),
        };
      });

      usulanList = [...usulanItems, ...reviewItems, ...ckanItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return NextResponse.json({
    data: usulanList,
    total: usulanList.length,
  });
}
