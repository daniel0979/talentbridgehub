import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2] ?? "/home/ubuntu/upload/job_seeker_platform.sql";
const outputDirectory = "/home/ubuntu/webdev-static-assets/talentbridgehub-legacy-profile-media";
const manifestPath = path.join(outputDirectory, "manifest.json");

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

function parseRows(valuesClause) {
  const rows = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < valuesClause.length; index += 1) {
    const character = valuesClause[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "'") {
        if (valuesClause[index + 1] === "'") index += 1;
        else inString = false;
      }
      continue;
    }
    if (character === "'") inString = true;
    else if (character === "(") {
      if (depth === 0) start = index + 1;
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) rows.push(valuesClause.slice(start, index));
    }
  }
  return rows;
}

function parseValues(row) {
  const values = [];
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index <= row.length; index += 1) {
    const character = row[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "'") {
        if (row[index + 1] === "'") index += 1;
        else inString = false;
      }
      continue;
    }
    if (character === "'") inString = true;
    else if (character === "," || index === row.length) {
      const raw = row.slice(start, index).trim();
      if (raw === "NULL") values.push(null);
      else if (raw.startsWith("'") && raw.endsWith("'")) {
        values.push(raw.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\"));
      } else values.push(raw);
      start = index + 1;
    }
  }
  return values;
}

function decodeDataUri(value) {
  if (typeof value !== "string") return null;
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return null;
  return { contentType: match[1].toLowerCase(), bytes: Buffer.from(match[2], "base64") };
}

function hasPrefix(bytes, prefix) {
  return bytes.length >= prefix.length && prefix.every((value, index) => bytes[index] === value);
}

function fileInfo(kind, decoded) {
  const { contentType, bytes } = decoded;
  if (kind === "photo") {
    if (contentType === "image/png" && bytes.length >= 64 && hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
    if (contentType === "image/jpeg" && bytes.length >= 1024 && hasPrefix(bytes, [0xff, 0xd8, 0xff]) && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9) return "jpg";
    if (contentType === "image/webp" && bytes.length >= 64 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
    return null;
  }
  if (contentType === "application/pdf" && bytes.length >= 512 && hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]) && bytes.includes(Buffer.from("%%EOF"))) return "pdf";
  if (contentType === "application/msword" && hasPrefix(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "doc";
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04])) return "docx";
  return null;
}

fs.mkdirSync(outputDirectory, { recursive: true });
const source = fs.readFileSync(sourcePath, "utf8");
const recovered = [];
const skipped = [];

for (const statement of splitStatements(source)) {
  const insertAt = statement.search(/\bINSERT\s+INTO\s+`?job_seekers`?/i);
  if (insertAt === -1) continue;
  const insert = statement.slice(insertAt);
  const match = /^INSERT\s+INTO\s+`?job_seekers`?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*);$/i.exec(insert);
  if (!match) continue;
  const columns = match[1].split(",").map(column => column.trim().replaceAll("`", ""));
  const columnIndex = Object.fromEntries(columns.map((column, index) => [column, index]));

  for (const row of parseRows(match[2])) {
    const values = parseValues(row);
    const id = Number(values[columnIndex.id]);
    const name = values[columnIndex.name];
    for (const [kind, column] of [["photo", "photo_url"], ["resume", "resume_url"]]) {
      const value = values[columnIndex[column]];
      if (!value) continue;
      const decoded = decodeDataUri(value);
      const extension = decoded && fileInfo(kind, decoded);
      if (!decoded || !extension) {
        skipped.push({ id, name, kind, reason: "The legacy data URI does not contain a valid allowed file." });
        continue;
      }
      const filename = `job-seeker-${id}-${kind}.${extension}`;
      fs.writeFileSync(path.join(outputDirectory, filename), decoded.bytes);
      recovered.push({ id, name, kind, contentType: decoded.contentType, filename, bytes: decoded.bytes.length });
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify({ recovered, skipped }, null, 2));
console.log(JSON.stringify({ recovered, skipped }, null, 2));
