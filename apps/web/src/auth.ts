import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Auth.js v5 — provider GitHub aktif hanya bila env tersedia.
 * Tanpa env, mode kurasi lokal dapat dinyalakan dengan CURATION_DEV=1
 * (khusus pengembangan; jangan pernah dipakai produksi).
 */
const githubConfigured = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

function authConfig() {
  if (githubConfigured) {
    return {
      secret: process.env.AUTH_SECRET ?? "dev-secret-pancasila-index",
      providers: [GitHub],
      trustHost: true,
    };
  }
  return {
    secret: process.env.AUTH_SECRET ?? "dev-secret-pancasila-index",
    providers: [],
    trustHost: true,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig());
