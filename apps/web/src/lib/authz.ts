import { auth } from "@/auth";
import { db } from "@/lib/db";

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
  if (process.env.CURATION_DEV === "1") {
    return { name: "dev-mode", role: "KURATOR" };
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
