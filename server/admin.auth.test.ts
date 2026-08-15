import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { ADMIN_COOKIE_NAME } from "./_core/adminAuth";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

function createAdminContext(overrides: Partial<TrpcContext> = {}): {
  ctx: TrpcContext;
  cookieCalls: CookieCall[];
} {
  const cookieCalls: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    admin: {
      id: 1,
      name: "Super Admin",
      email: "admin@talentbridgehub.com",
      password: "hashed",
      role: "super_admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, _value: string, options: Record<string, unknown>) => {
        cookieCalls.push({ name, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookieCalls.push({ name, options });
      },
    } as TrpcContext["res"],
    ...overrides,
  };

  return { ctx, cookieCalls };
}

describe("admin.auth", () => {
  it("exposes `me` for an authenticated admin", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.admin.auth.me();

    expect(me).toMatchObject({
      id: 1,
      email: "admin@talentbridgehub.com",
      role: "super_admin",
    });
  });

  it("logout clears the admin session cookie", async () => {
    const { ctx, cookieCalls } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.auth.logout();

    expect(result).toEqual({ success: true });
    const logoutCall = cookieCalls.find((c) => c.name === ADMIN_COOKIE_NAME);
    expect(logoutCall).toBeDefined();
    expect(logoutCall?.options).toMatchObject({
      maxAge: -1,
      httpOnly: true,
      path: "/",
    });
  });
});
