import { auth } from "@/auth";
import { db } from "@/lib/db";
import { devCurationAllowed } from "@pancasila-index/data";

export type Role = "ADMIN" | "KURATOR" | "KONTRIBUTOR" | "PEMBACA";

const RANK: Record<Role, number> = {
  PEMBACA: 0,
  KONTRIBUTOR: 1,
  KURATOR: 2,
  ADMIN: 3,
};

export interface CurrentUser {
  id?: string;
  name?: string | null;
  role: Role;
}

/**
 * Mode kurasi tanpa login untuk pengembangan lokal.
 *
 * DIKUNCI ke non-produksi. Sebelumnya `CURATION_DEV=1` saja sudah cukup,
 * tanpa penjaga lingkungan apa pun: satu variabel yang ikut tersalin ke
 * environment produksi akan memberi peran KURATOR kepada SETIAP pengunjung
 * anonim. Karena penolakan hanya perlu keputusan terakhir, siapa pun bisa
 * mengeluarkan penilaian dari dataset publik - dan jejak auditnya mencatat
 * actorId null, jadi tidak ada yang bertanggung jawab.
 *
 * Kalau variabel ini ditemukan aktif di produksi, ia diabaikan dan dicatat
 * sebagai kesalahan konfigurasi, bukan diam-diam dihormati.
 */
function devCuratorAllowed(): boolean {
  const { allowed, misconfigured } = devCurationAllowed({
    CURATION_DEV: process.env.CURATION_DEV,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (misconfigured) {
    console.error(
      "[authz] CURATION_DEV=1 diabaikan: mode kurasi tanpa login TIDAK BOLEH " +
        "aktif di produksi. Hapus variabel ini dari environment."
    );
  }
  return allowed;
}

/** Sesi aktif dengan peran dari token; mode dev mengembalikan kurator semu. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (session?.user?.role) {
    return {
      id: session.user.id,
      name: session.user.name,
      role: session.user.role,
    };
  }
  if (devCuratorAllowed()) {
    // id sengaja diberi nilai: tanpa ini jejak audit mencatat actorId null
    // dan keputusan kurasi tidak dapat dilacak ke siapa pun.
    return { id: "dev-mode", name: "dev-mode", role: "KURATOR" };
  }
  return null;
}

/** Peran minimum yang dipenuhi? */
export function hasRole(user: CurrentUser | null, min: Role): boolean {
  if (!user) return false;
  return RANK[user.role] >= RANK[min];
}

/** Tulis jejak audit; kegagalannya tidak boleh mematahkan alur utama. */
export async function audit(
  user: CurrentUser | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: unknown
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: user?.id ?? null,
        action,
        entity,
        entityId,
        meta: meta === undefined ? undefined : JSON.stringify(meta),
      },
    });
  } catch (err) {
    console.error("audit gagal:", err);
  }
}
