import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "ADMIN" | "KURATOR" | "KONTRIBUTOR" | "PEMBACA";
      affiliation?: string | null;
      title?: string | null;
      funding?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "ADMIN" | "KURATOR" | "KONTRIBUTOR" | "PEMBACA";
    affiliation?: string | null;
    title?: string | null;
    funding?: string | null;
  }
}

