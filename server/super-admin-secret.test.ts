import { describe, expect, it } from "vitest";
import { adminRouter } from "./adminRouter";
import type { TrpcContext } from "./_core/context";

function createLoginContext(): TrpcContext {
  return {
    user: null,
    admin: null,
    jobSeeker: null,
    company: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => undefined } as TrpcContext["res"],
  };
}

describe("super-admin production secret", () => {
  it("authenticates the seeded super-admin with the supplied secure password", async () => {
    const password = process.env.SUPER_ADMIN_PASSWORD;
    expect(password).toBeTruthy();

    const caller = adminRouter.createCaller(createLoginContext());
    const result = await caller.auth.login({
      email: "admin@talentbridgehub.com",
      password: password!,
    });

    expect(result.admin.email).toBe("admin@talentbridgehub.com");
    expect(result.admin.role).toBe("super_admin");
  });
});
