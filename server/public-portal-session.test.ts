import { describe, expect, it } from "vitest";
import { companyRouter } from "./companyRouter";
import { jobSeekerRouter } from "./jobSeekerRouter";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    admin: null,
    jobSeeker: null,
    company: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("public portal-session lookups", () => {
  it("returns null for an anonymous job-seeker session check", async () => {
    const caller = jobSeekerRouter.createCaller(createPublicContext());
    await expect(caller.auth.me()).resolves.toBeNull();
  });

  it("returns null for an anonymous company session check", async () => {
    const caller = companyRouter.createCaller(createPublicContext());
    await expect(caller.auth.me()).resolves.toBeNull();
  });

  it("keeps protected job-seeker and company procedures unavailable to anonymous visitors", async () => {
    const jobSeekerCaller = jobSeekerRouter.createCaller(createPublicContext());
    const companyCaller = companyRouter.createCaller(createPublicContext());

    await expect(jobSeekerCaller.applications.mine()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(companyCaller.jobs.mine()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
