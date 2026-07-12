import { PrismaClient } from "@prisma/client";

// Reused across hot-reloads in dev (tsx watch) so we don't open a new
// connection pool on every file save.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
