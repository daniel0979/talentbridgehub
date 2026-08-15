import fs from "node:fs";

const sourcePath = process.argv[2] ?? "/home/ubuntu/upload/job_seeker_platform.sql";
const sql = fs.readFileSync(sourcePath, "utf8");
const counts = new Map();

function splitStatements(source) {
  const statements = [];
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "'") {
        if (source[index + 1] === "'") {
          index += 1;
        } else {
          inString = false;
        }
      }
    } else if (character === "'") {
      inString = true;
    } else if (character === ";") {
      statements.push(source.slice(start, index + 1));
      start = index + 1;
    }
  }
  return statements;
}

function countValuesRows(valuesClause) {
  let depth = 0;
  let rowCount = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < valuesClause.length; index += 1) {
    const character = valuesClause[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "'") {
        if (valuesClause[index + 1] === "'") {
          index += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (character === "'") {
      inString = true;
    } else if (character === "(") {
      if (depth === 0) rowCount += 1;
      depth += 1;
    } else if (character === ")") {
      depth = Math.max(0, depth - 1);
    }
  }
  return rowCount;
}

for (const statement of splitStatements(sql)) {
  const match = /\bINSERT\s+INTO\s+`?([a-zA-Z0-9_]+)`?[\s\S]*?\bVALUES\b([\s\S]*);\s*$/i.exec(statement);
  if (!match) continue;
  const [, table, valuesClause] = match;
  counts.set(table, (counts.get(table) ?? 0) + countValuesRows(valuesClause));
}

const result = Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
console.log(JSON.stringify({ sourcePath, tableRowCounts: result }, null, 2));
