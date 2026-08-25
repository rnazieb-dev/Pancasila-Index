import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { db } from "@/lib/db";

/**
 * Auth.js v5 + Prisma.
 *
 * - Sesi memakai JWT (tanpa tabel session) agar cepat; identitas & peran
 *   disimpan di token.
 * - Peran ditetapkan saat login pertama:
 *     · pengguna pertama            -> ADMIN
 *     · ada di CURATOR_GITHUB_LOGINS -> KURATOR
 *     · selainnya                   -> KONTRIBUTOR
 * - Setiap login tercatat di AuditLog.
 *
 * Tipe Session/JWT diperluas lewat src/types/next-auth.d.ts; callback
 * dibiarkan tanpa anotasi manual supaya tipe resmi NextAuth dipakai.
 */

const githubConfigured = Boolean(
  process.env.GITHUB_ID && process.env.GITHUB_SECRET
);

const curatorLogins = new Set(
  (process.env.CURATOR_GITHUB_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

function authConfig() {
  const base = {
    secret: process.env.AUTH_SECRET ?? "dev-secret-pancasila-index",
    trustHost: true,
  };
  if (!githubConfigured) return { ...base, providers: [] };

  return {
    ...base,
    providers: [GitHub],
    callbacks: {
      async jwt({ token, user, profile }: {
        token: Record<string, unknown> & { uid?: string; role?: "ADMIN" | "KURATOR" | "KONTRIBUTOR" | "PEMBACA" };
        user?: { name?: string | null; email?: string | null; image?: string | null };
        profile?: { id?: number | string | null; login?: string } | null;
      }) {
        if (user && profile && profile.id != null) {
          const githubId = String(profile.id);
          const login = String(profile.login ?? user.email ?? "").toLowerCase();

          const existing = await db.user.findUnique({ where: { githubId } });

          let role: "ADMIN" | "KURATOR" | "KONTRIBUTOR" = "KONTRIBUTOR";
          if (!existing) {
            const totalUsers = await db.user.count();
            role =
              totalUsers === 0
                ? "ADMIN"
                : curatorLogins.has(login)
                  ? "KURATOR"
                  : "KONTRIBUTOR";
          }

          const data = {
            name: user.name,
            image: user.image,
            email: user.email,
          };
          const dbUser = existing
            ? await db.user.update({ where: { id: existing.id }, data })
            : await db.user.create({ data: { githubId, role, ...data } });

          await db.auditLog.create({
            data: {
              actorId: dbUser.id,
              action: "auth.signin",
              entity: "User",
              entityId: dbUser.id,
              meta: JSON.stringify({ login }),
            },
          });

          token.uid = dbUser.id;
          token.role = dbUser.role;
        }
        return token;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async session({ session, token }: { session: any; token: Record<string, unknown> & { uid?: string; role?: "ADMIN" | "KURATOR" | "KONTRIBUTOR" | "PEMBACA" } }) {
        if (session?.user) {
          session.user.id = token.uid;
          session.user.role = token.role;
        }
        return session;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig());
