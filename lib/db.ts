import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function makeClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Proxy defers instantiation until the first DB call — importing this module
// is safe even when DATABASE_URL is not available at build time.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = (globalThis.prisma ??= makeClient());
    return Reflect.get(client, prop);
  },
});
