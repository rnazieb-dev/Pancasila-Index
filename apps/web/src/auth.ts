import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

/**
 * Auth.js v5 + Prisma + Sesi Persisten (Instagram / Google Style).
 *
 * - Sesi JWT persisten selama 1 TAHUN (365 hari) sehingga pengguna tidak akan logout
 *   otomatis saat menutup browser/tab. Sesi hanya berakhir bila pengguna menekan
 *   tombol Logout di halaman Pengaturan.
 * - Mendukung pendaftaran mandiri (Credentials: Email & Password) + GitHub OAuth.
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "dev-secret-pancasila-index-auth-2026",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 tahun persisten
  },
  providers: [
    ...(githubConfigured ? [GitHub] : []),
    Credentials({
      name: "Email dan Sandi",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Catat AuditLog
        await db.auditLog.create({
          data: {
            actorId: user.id,
            action: "auth.signin.credentials",
            entity: "User",
            entityId: user.id,
            meta: JSON.stringify({ email: user.email }),
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          affiliation: user.affiliation,
          title: user.title,
          funding: user.funding,
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, profile }: any) {
      if (user) {
        // Dari credentials login
        token.uid = user.id;
        token.role = user.role || "KONTRIBUTOR";
        token.affiliation = user.affiliation || null;
        token.title = user.title || null;
        token.funding = user.funding || null;
      } else if (profile && profile.id != null) {
        // Dari GitHub OAuth login
        const githubId = String(profile.id);
        const login = String(profile.login ?? user?.email ?? "").toLowerCase();

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
          name: user?.name,
          image: user?.image,
          email: user?.email,
        };
        const dbUser = existing
          ? await db.user.update({ where: { id: existing.id }, data })
          : await db.user.create({ data: { githubId, role, ...data } });

        await db.auditLog.create({
          data: {
            actorId: dbUser.id,
            action: "auth.signin.github",
            entity: "User",
            entityId: dbUser.id,
            meta: JSON.stringify({ login }),
          },
        });

        token.uid = dbUser.id;
        token.role = dbUser.role;
        token.affiliation = dbUser.affiliation;
        token.title = dbUser.title;
        token.funding = dbUser.funding;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.affiliation = token.affiliation;
        session.user.title = token.title;
        session.user.funding = token.funding;
      }
      return session;
    },
  },
  pages: {
    signIn: "/masuk",
  },
});
