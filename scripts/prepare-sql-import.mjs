import fs from "node:fs";
import path from "node:path";

const sourceFile = "/home/ubuntu/talentbridgehub/database/job_seeker_platform.sql";
const outputDirectory = "/home/ubuntu/talentbridgehub-live/.migration-sql";
const targetChunkSize = 45000;

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (!quote && char === "-" && next === "-" && /\s/.test(sql[index + 2] ?? "")) {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (!quote && char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    current += char;

    if (quote) {
      if (char === "\\") {
        current += next ?? "";
        index += 1;
      } else if (char === quote) {
        if (next === quote) {
          current += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
    } else if (char === ";") {
      const statement = current.trim().replace(/;$/, "");
      if (statement) statements.push(statement);
      current = "";
    }
  }

  const remaining = current.trim();
  if (remaining) statements.push(remaining);
  return statements;
}

function shouldKeep(statement) {
  const normalized = statement.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith("set ") || normalized.startsWith("start transaction") || normalized.startsWith("commit")) {
    return false;
  }
  return !/^(create table|alter table|insert into) `?(users|__drizzle_migrations)`?\b/.test(normalized);
}

function wasAppliedInInitialBatch(statement) {
  const normalized = statement.replace(/\s+/g, " ").trim().toLowerCase();
  return /^(create table|insert into) `?(activity_logs|admins|applications)`?\b/.test(normalized);
}

const rawDump = fs.readFileSync(sourceFile, "utf8");
let deferredEmbeddedAssets = 0;
let skippedReviewDataStatements = 0;
const statements = splitStatements(rawDump)
  .filter(shouldKeep)
  .filter(statement => !wasAppliedInInitialBatch(statement))
  .filter(statement => {
    const normalized = statement.replace(/\s+/g, " ").trim().toLowerCase();
    const isReviewData = /^insert into `?(company_reviews|job_seeker_reviews|partner_companies)`?\b/.test(normalized);
    if (isReviewData) skippedReviewDataStatements += 1;
    return !isReviewData;
  })
  .map(statement => {
    const rewritten = statement.replace(/'data:[^']*?;base64,[^']*'/gi, () => {
      deferredEmbeddedAssets += 1;
      return "NULL";
    });
    return rewritten;
  });
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const chunks = [];
let currentChunk = [];
let currentLength = 0;

for (const statement of statements) {
  const statementWithTerminator = `${statement};\n`;
  if (currentChunk.length > 0 && currentLength + statementWithTerminator.length > targetChunkSize) {
    chunks.push(currentChunk.join(""));
    currentChunk = [];
    currentLength = 0;
  }
  currentChunk.push(statementWithTerminator);
  currentLength += statementWithTerminator.length;
}

if (currentChunk.length > 0) chunks.push(currentChunk.join(""));

const manifest = chunks.map((chunk, index) => {
  const fileName = `${String(index + 1).padStart(3, "0")}.sql`;
  fs.writeFileSync(path.join(outputDirectory, fileName), chunk);
  return { fileName, bytes: Buffer.byteLength(chunk) };
});

fs.writeFileSync(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify({ sourceFile, statements: statements.length, deferredEmbeddedAssets, skippedReviewDataStatements, chunks: manifest }, null, 2)}\n`
);

console.log(`Prepared ${manifest.length} SQL chunks containing ${statements.length} statements; deferred ${deferredEmbeddedAssets} embedded asset payloads and skipped ${skippedReviewDataStatements} legacy review-data statements.`);
