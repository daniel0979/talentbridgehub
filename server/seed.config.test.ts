import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("production seed configuration", () => {
  it("requires a supplied super-admin password rather than embedding a default", () => {
    const seedSource = fs.readFileSync(path.resolve(process.cwd(), "server/seed.ts"), "utf8");

    expect(seedSource).toContain("SUPER_ADMIN_PASSWORD is required");
    expect(seedSource).not.toContain('SUPER_ADMIN_PASSWORD ?? "password123"');
  });
});
