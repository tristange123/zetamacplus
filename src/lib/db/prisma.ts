import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

if (process.env.APP_ENV === "test") {
  loadEnv({ path: ".env.test", override: true, quiet: true });
}

// Reuse one client per runtime so warm serverless invocations (Vercel) and dev hot reloads don't open new pools.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma
  ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
globalForPrisma.prisma = prisma;

export default prisma