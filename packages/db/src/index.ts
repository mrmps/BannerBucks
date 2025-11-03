import { neon, neonConfig } from "@neondatabase/serverless";
import { eq as drizzleEq, isNotNull as drizzleIsNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file."
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);
export const eq = drizzleEq;
export const isNotNull = drizzleIsNotNull;
