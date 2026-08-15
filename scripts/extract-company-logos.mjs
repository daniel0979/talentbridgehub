import fs from "node:fs";
import path from "node:path";

const sourceSql = "/home/ubuntu/talentbridgehub/database/job_seeker_platform.sql";
const outputDirectory = "/home/ubuntu/webdev-static-assets/talentbridgehub-company-logos";
const manifestPath = path.join(outputDirectory, "manifest.json");
const mimeExtension = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

fs.mkdirSync(outputDirectory, { recursive: true });
const sql = fs.readFileSync(sourceSql, "utf8");
const recordPattern = /\((\d+), '([^']+)', '(data:image\/(?:png|jpeg|webp);base64,([^']+))',/g;
const recovered = [];

for (const match of sql.matchAll(recordPattern)) {
  const [, id, name, dataUri, base64] = match;
  const mime = dataUri.slice("data:".length, dataUri.indexOf(";base64,"));
  const extension = mimeExtension[mime];
  if (!extension) continue;

  const bytes = Buffer.from(base64, "base64");
  if (bytes.length < 64) {
    throw new Error(`Recovered logo for ${name} is too small to be a valid image.`);
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `company-${id}-${slug}.${extension}`;
  const outputPath = path.join(outputDirectory, filename);
  fs.writeFileSync(outputPath, bytes);
  recovered.push({ id: Number(id), name, mime, filename, bytes: bytes.length });
}

fs.writeFileSync(manifestPath, JSON.stringify(recovered, null, 2));
console.log(JSON.stringify(recovered, null, 2));
