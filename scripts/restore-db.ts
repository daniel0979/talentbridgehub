import "dotenv/config";
import { createConnection } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Restore the bundled database dump (database/job_seeker_platform.sql) into
 * the target MySQL database (from DATABASE_URL). Used to migrate the existing
 * local data (job seekers, companies, jobs, applications, reviews, admin
 * accounts, etc.) to a managed host (Render / Railway / Fly.io).
 *
 * Usage:
 *   DATABASE_URL=mysql://user:pass@host:3306/db pnpm tsx scripts/restore-db.ts
 *
 * NOTE: The phpMyAdmin dump contains plain `CREATE TABLE` statements. The app
 * calls `ensureSchema()` on boot and adds any missing columns/tables, so after
 * importing this dump the app works immediately.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to restore the database.");
  }

  const dumpPath = resolve(__dirname, "../database/job_seeker_platform.sql");
  const sql = readFileSync(dumpPath, "utf-8");

  const conn = await createConnection(databaseUrl);
  try {
    // phpMyAdmin dumps contain `/*!40101 ... */` header comments, `SET` lines,
    // and `START TRANSACTION` — skip those. Keep the `CREATE TABLE` and
    // `INSERT` statements. Split on `;\n` (the dump uses one statement per
    // line, so this is safe).
    const statements: string[] = [];
    for (const raw of sql.split(/;\s*\r?\n/)) {
      const s = raw.trim();
      if (!s) continue;
      if (s.startsWith("/*!")) continue;
      if (s.startsWith("SET ") || s.startsWith("START TRANSACTION")) continue;
      statements.push(s.endsWith(";") ? s : `${s};`);
    }

    console.log(`[restore] Executing ${statements.length} statements...`);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log("[restore] Done.");
  } finally {
    await conn.end();
  }
}

main()
  .catch((err) => {
    console.error("[restore] Failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

