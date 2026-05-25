import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/server/model/schema";

let _db;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getDb();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);

export { schema };
