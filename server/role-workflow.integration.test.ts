import { describe, expect, it } from "vitest";
import { adminRouter } from "./adminRouter";
import { companyRouter } from "./companyRouter";
import { jobSeekerRouter } from "./jobSeekerRouter";
import { getAdminByEmail, getCompanyById, getJobSeekerById } from "./db";
import type { TrpcContext } from "./_core/context";

function createContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    admin: null,
    jobSeeker: null,
    company: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
    ...overrides,
  };
}

describe("preserved role workflows", () => {
  it("returns an existing job seeker application through the authenticated tracking route", async () => {
    const jobSeeker = await getJobSeekerById(2);
    expect(jobSeeker).toBeDefined();

    const caller = jobSeekerRouter.createCaller(createContext({ jobSeeker: jobSeeker! }));
    const applications = await caller.applications.mine();

    expect(applications.some((application) => application.jobId === 13)).toBe(true);
  });

  it("enforces duplicate-safe registration through both public account routes without creating records", async () => {
    const jobSeeker = await getJobSeekerById(2);
    const company = await getCompanyById(7);
    expect(jobSeeker).toBeDefined();
    expect(company?.ownerEmail).toBeTruthy();

    const publicContext = createContext();
    const jobSeekerCaller = jobSeekerRouter.createCaller(publicContext);
    const companyCaller = companyRouter.createCaller(publicContext);

    await expect(
      jobSeekerCaller.auth.register({
        name: jobSeeker!.name,
        email: jobSeeker!.email,
        password: "DuplicateSafe123!",
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(
      companyCaller.auth.register({
        name: company!.name,
        ownerEmail: company!.ownerEmail!,
        password: "DuplicateSafe123!",
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("returns an approved company’s own job postings through the authenticated company route", async () => {
    const company = await getCompanyById(7);
    expect(company?.status).toBe("approved");

    const caller = companyRouter.createCaller(createContext({ company: company! }));
    const jobs = await caller.jobs.mine();

    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((job) => job.companyId === company!.id)).toBe(true);
  });

  it("exposes imported companies, jobs, and applications through protected admin management routes", async () => {
    const admin = await getAdminByEmail("admin@talentbridgehub.com");
    expect(admin?.role).toBe("super_admin");

    const caller = adminRouter.createCaller(createContext({ admin: admin! }));
    const [companies, jobs, applications] = await Promise.all([
      caller.management.companies.list(),
      caller.management.jobs.list(),
      caller.management.applications.list(),
    ]);

    expect(companies.some((company) => company.id === 7)).toBe(true);
    expect(jobs.some((job) => job.id === 13)).toBe(true);
    expect(applications.some((application) => application.jobId === 13)).toBe(true);

    const approvedCompany = await caller.management.companies.updateStatus({
      id: 7,
      status: "approved",
    });
    const approvedJob = await caller.management.jobs.updateStatus({
      id: 13,
      status: "approved",
    });
    expect(approvedCompany.status).toBe("approved");
    expect(approvedJob.status).toBe("approved");
  });
});
