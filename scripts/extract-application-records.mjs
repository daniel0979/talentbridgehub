import fs from "node:fs";

const sourceFile = "/home/ubuntu/talentbridgehub/database/job_seeker_platform.sql";
const outputFile = "/home/ubuntu/talentbridgehub-live/.migration-sql/application-records.sql";
const source = fs.readFileSync(sourceFile, "utf8");

const start = source.indexOf("INSERT INTO `applications`");
if (start < 0) throw new Error("No application records were found in the source dump.");

let quote = null;
let statementEnd = -1;
for (let index = start; index < source.length; index += 1) {
  const char = source[index];
  const next = source[index + 1];
  if (quote) {
    if (char === "\\") {
      index += 1;
    } else if (char === quote) {
      quote = null;
    }
  } else if (char === "'" || char === '"') {
    quote = char;
  } else if (char === ";") {
    statementEnd = index;
    break;
  }
}

if (statementEnd < 0) throw new Error("The application statement is not terminated.");

const statement = source
  .slice(start, statementEnd + 1)
  .replace(/'data:[^']*?;base64,[^']*'/gi, "NULL");

fs.writeFileSync(outputFile, statement);
console.log(`Prepared application import (${Buffer.byteLength(statement)} bytes).`);
