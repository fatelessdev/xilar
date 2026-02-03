import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// HTTP adapter for serverless environments (Vercel, etc.)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export all schema for easy access
export * from "./schema";
