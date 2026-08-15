import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public company directory data", () => {
  it("selects only non-sensitive profile fields", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "server/db.ts"), "utf8");
    const queryBlock = source.slice(
      source.indexOf("export async function getApprovedCompanies"),
      source.indexOf("// ---------------------------------------------------------------------------\n// Company reviews", source.indexOf("export async function getApprovedCompanies"))
    );

    expect(queryBlock).toContain("id: companies.id");
    expect(queryBlock).toContain("website: companies.website");
    expect(queryBlock).not.toContain("password: companies.password");
    expect(queryBlock).not.toContain("ownerEmail: companies.ownerEmail");
    expect(queryBlock).not.toContain(".select()\n      .from(companies)");
  });
});
