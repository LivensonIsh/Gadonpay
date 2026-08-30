import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __gadonpayPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __gadonpayPool: Pool | undefined;
}

const pool =
  global.__gadonpayPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);

export const prisma =
  global.__gadonpayPrisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__gadonpayPrisma = prisma;
  global.__gadonpayPool = pool;
}
