import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// HTTP adapter for serverless environments (Vercel, etc.)
const databaseUrl = process.env.DATABASE_URL;
const createDb = (url: string) => drizzle(neon(url), { schema });
type Database = ReturnType<typeof createDb>;

const missingDatabaseProxy = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "DATABASE_URL is not set. Configure your database environment variables before using DB queries.",
      );
    },
  },
);

export const db: Database = databaseUrl
  ? createDb(databaseUrl)
  : (missingDatabaseProxy as Database);

// Export all schema for easy access
export * from "./schema";
