import { describe, expect, it } from "vitest";
import { getAdminByEmail } from "./db";
import { verifyPassword } from "./_core/adminAuth";

describe("super-admin credential rotation", () => {
  it("does not retain the inherited default password", async () => {
    const admin = await getAdminByEmail("admin@talentbridgehub.com");

    expect(admin).toBeDefined();
    expect(admin?.role).toBe("super_admin");
    await expect(verifyPassword("password123", admin!.password)).resolves.toBe(false);
  });
});
