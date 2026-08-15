import "dotenv/config";
import fs from "node:fs";
import { createConnection } from "mysql2/promise";

const sqlPath = process.argv[2] ?? "scripts/reconcile-original-records.sql";
const allowedTables = new Set([
  "company_reviews",
  "job_seeker_reviews",
  "jobs",
  "conversations",
  "messages",
  "notifications",
]);

function splitStatements(source) {
  const statements = [];
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "'") {
        if (source[index + 1] === "'") index += 1;
        else inString = false;
      }
      continue;
    }

    if (character === "'") inString = true;
    else if (character === ";") {
      statements.push(source.slice(start, index + 1));
      start = index + 1;
    }
  }
  return statements;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const source = fs.readFileSync(sqlPath, "utf8");
const statements = splitStatements(source)
  .map(statement => statement.slice(Math.max(0, statement.search(/\bINSERT\s+IGNORE\s+INTO\b/i))).trim())
  .filter(statement => /^INSERT\s+IGNORE\s+INTO\b/i.test(statement));

if (statements.length === 0) throw new Error("No generated INSERT IGNORE statements found.");

for (const statement of statements) {
  const tableMatch = /^INSERT\s+IGNORE\s+INTO\s+`?([a-zA-Z0-9_]+)`?/i.exec(statement);
  if (!tableMatch || !allowedTables.has(tableMatch[1])) {
    throw new Error("Reconciliation file contains an unapproved table statement.");
  }
}

const connection = await createConnection(databaseUrl);
try {
  const results = [];
  for (const statement of statements) {
    const table = /^INSERT\s+IGNORE\s+INTO\s+`?([a-zA-Z0-9_]+)`?/i.exec(statement)?.[1] ?? "unknown";
    const [result] = await connection.query(statement);
    results.push({ table, affectedRows: result.affectedRows, warningStatus: result.warningStatus });
  }
  console.log(JSON.stringify({ restored: results }, null, 2));
} finally {
  await connection.end();
}
