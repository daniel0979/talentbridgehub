import "dotenv/config";
import { readFileSync } from "node:fs";
import { createConnection } from "mysql2/promise";

/**
 * Applies a single Drizzle migration SQL file directly to the database.
 * Used when the DB was created from the raw SQL file (not via drizzle-kit
 * migrations), so the migration journal doesn't match the live schema.
 *
 * Usage: pnpm tsx scripts/apply-migration.ts drizzle/0002_nostalgic_the_renegades.sql
 */
async function main() {
  const file = process.argv[2];
  if (!file) {
    throw new Error("Usage: apply-migration.ts <migration.sql>");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const sql = readFileSync(file, "utf-8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  const conn = await createConnection(databaseUrl);
  try {
    for (const statement of statements) {
      console.log(`[apply] ${statement.slice(0, 80)}...`);
      // A statement may contain multiple ALTERs separated by semicolons.
      // Drizzle generates one statement per breakpoint, but run them as-is.
      await conn.query(statement);
    }
    console.log("[apply] Done.");
  } finally {
    await conn.end();
  }
}

main()
  .catch((err) => {
    console.error("[apply] Failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
