import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DATABASE_URL || "";
export const isDatabaseAvailable = Boolean(
  dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")
);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
