import Link from "next/link";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Log aktivitas kurasi — Pancasila Index" };

interface LogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: string | null;
  createdAt: Date;
  actorName: string;
}

/** Warna aksi agar pola keputusan terbaca sekali lirik. */
function actionTone(action: string): string {
  if (action.includes("approved") || action.includes("publish"))
    return "text-green-400";
  if (action.includes("rejected") || action.includes("deny"))
    return "text-red-400";
  if (action.includes("role")) return "text-sky-400";
  return "text-[var(--muted)]";
}

export default async function KurasiLogPage() {
  // Halaman publik: transparansi proses kurasi tanpa butuh login.
  // Kegagalan DB tidak boleh mematikan halaman — tampilkan status kosong.
  let rows: LogRow[] = [];
  let dbError = false;
  try {
    const found = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { name: true } } },
    });
    rows = found.map((r) => ({
      id: r.id,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId,
      meta: r.meta,
      createdAt: r.createdAt,
      actorName: r.actor?.name ?? "dev/anonim",
    }));
  } catch {
    dbError = true;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/kurasi"
        className="text-sm text-[var(--muted)] hover:text-white"
      >
        ← antrean kurasi
      </Link>
      <h1 className="mt-3 text-3xl font-bold">Log aktivitas kurasi</h1>
      <p className="mt-2 text-sm text-[var(--muted)] max-w-2xl">
        100 peristiwa terakhir dari jejak audit (AuditLog) — setiap keputusan
        kurasi, perubahan peran, dan sign-in tercatat di sini demi akuntabilitas
        publik. Halaman ini terbuka untuk semua.
      </p>

      {dbError && (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          Database lapisan dinamis belum tersedia. Jalankan{" "}
          <code>pnpm --filter web prisma migrate dev</code> lalu muat ulang.
        </p>
      )}

      {!dbError && rows.length === 0 && (
        <p className="mt-8 py-10 text-center text-sm text-[var(--muted)]">
          Belum ada aktivitas tercatat.
        </p>
      )}

      {rows.length > 0 && (
        <ul className="mt-6 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--panel)]">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 text-xs items-baseline">
              <span className="tabular-nums text-[var(--muted)] w-36 shrink-0">
                {r.createdAt.toISOString().replace("T", " ").slice(0, 16)}
              </span>
              <span className={`font-semibold w-36 shrink-0 ${actionTone(r.action)}`}>
                {r.action}
              </span>
              <span className="grow min-w-48">
                {r.entity}
                {r.entityId ? (
                  <>
                    {" · "}
                    <code className="opacity-80">{r.entityId}</code>
                  </>
                ) : null}
                {r.meta && r.meta !== "{}" && (
                  <span className="block text-[var(--muted)] mt-0.5 break-all">
                    {r.meta.length > 160 ? `${r.meta.slice(0, 157)}…` : r.meta}
                  </span>
                )}
              </span>
              <span className="text-[var(--muted)] shrink-0">{r.actorName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
