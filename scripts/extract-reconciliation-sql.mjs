import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2] ?? "/home/ubuntu/upload/job_seeker_platform.sql";
const outputPath = process.argv[3] ?? path.resolve("scripts/reconcile-original-records.sql");
const restoreTables = new Set([
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

const sourceSql = fs.readFileSync(sourcePath, "utf8");
const selected = [];

for (const statement of splitStatements(sourceSql)) {
  const insertAt = statement.search(/\bINSERT\s+INTO\s+/i);
  if (insertAt === -1) continue;

  const insert = statement.slice(insertAt).trim();
  const tableMatch = /^INSERT\s+INTO\s+`?([a-zA-Z0-9_]+)`?/i.exec(insert);
  if (!tableMatch || !restoreTables.has(tableMatch[1])) continue;

  selected.push({
    table: tableMatch[1],
    statement: insert.replace(/^INSERT\s+INTO/i, "INSERT IGNORE INTO"),
  });
}

const header = [
  "-- Generated from the user-provided SQL dump. Do not edit source data manually.",
  "-- Every statement is INSERT IGNORE, so existing managed rows are never overwritten.",
  "",
].join("\n");

fs.writeFileSync(outputPath, `${header}${selected.map(item => item.statement).join("\n\n")}\n`);
console.log(JSON.stringify({ outputPath, tables: selected.map(item => item.table) }, null, 2));
