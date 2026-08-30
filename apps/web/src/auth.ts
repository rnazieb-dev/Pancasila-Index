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

const githubClientId =
  process.env.AUTH_GITHUB_ID ||
  process.env.GITHUB_ID ||
  process.env.GITHUB_CLIENT_ID;

const githubClientSecret =
  process.env.AUTH_GITHUB_SECRET ||
  process.env.GITHUB_SECRET ||
  process.env.GITHUB_CLIENT_SECRET;

const githubConfigured = Boolean(githubClientId && githubClientSecret);

const curatorLogins = new Set(
  (process.env.CURATOR_GITHUB_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret-pancasila-index-auth-2026",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 tahun persisten
  },
  providers: [
    ...(githubConfigured
      ? [
          GitHub({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }),
        ]
      : []),
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

        // Catat AuditLog (tanpa menyimpan email di meta demi minimalisasi data pribadi)
        await db.auditLog.create({
          data: {
            actorId: user.id,
            action: "auth.signin.credentials",
            entity: "User",
            entityId: user.id,
            meta: null,
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
    async jwt({ token, user, profile, account }: any) {
      if (user) {
        // Dari credentials login
        token.uid = user.id;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.image = user.image || token.image;
        token.role = user.role || "KONTRIBUTOR";
        token.affiliation = user.affiliation || null;
        token.title = user.title || null;
        token.funding = user.funding || null;
      } else if (profile && (profile.id != null || account?.provider === "github")) {
        // Dari GitHub OAuth login
        const githubId = String(profile.id || profile.login);
        const login = String(profile.login ?? user?.email ?? "").toLowerCase();

        // Default values from GitHub profile directly
        token.uid = token.uid || `github_${githubId}`;
        token.name = profile.name || profile.login || token.name || "Kontributor GitHub";
        token.email = profile.email || token.email || `${login}@users.noreply.github.com`;
        token.image = profile.avatar_url || profile.image || token.image;
        token.githubUsername = login;
        token.role = token.role || (curatorLogins.has(login) ? "KURATOR" : "KONTRIBUTOR");

        // Sync with PostgreSQL / Prisma jika database tersedia
        try {
          const existing = await db.user.findFirst({
            where: {
              OR: [
                { githubId },
                ...(profile.email ? [{ email: profile.email }] : []),
              ],
            },
          });

          let role: "ADMIN" | "KURATOR" | "KONTRIBUTOR" =
            (existing?.role as "ADMIN" | "KURATOR" | "KONTRIBUTOR") ||
            (curatorLogins.has(login) ? "KURATOR" : "KONTRIBUTOR");

          if (!existing) {
            const totalUsers = await db.user.count().catch(() => 1);
            if (totalUsers === 0) role = "ADMIN";
          }

          const data = {
            githubId,
            name: token.name,
            email: token.email,
            image: token.image,
            role,
          };

          const dbUser = existing
            ? await db.user.update({ where: { id: existing.id }, data })
            : await db.user.create({ data });

          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.affiliation = dbUser.affiliation || token.affiliation || null;
          token.title = dbUser.title || token.title || null;
          token.funding = dbUser.funding || token.funding || null;
          token.bio = dbUser.bio || token.bio || null;

          await db.auditLog
            .create({
              data: {
                actorId: dbUser.id,
                action: "auth.signin.github",
                entity: "User",
                entityId: dbUser.id,
                meta: null,
              },
            })
            .catch(() => {});
        } catch (dbErr) {
          console.warn("Database sync during GitHub login skipped:", dbErr);
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.uid;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.image = token.image || session.user.image;
        session.user.role = token.role || "KONTRIBUTOR";
        session.user.githubUsername = token.githubUsername || null;
        session.user.affiliation = token.affiliation || null;
        session.user.title = token.title || null;
        session.user.funding = token.funding || null;
        session.user.bio = token.bio || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/masuk",
  },
});
