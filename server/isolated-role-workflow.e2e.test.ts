import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { adminRouter } from "./adminRouter";
import { companyRouter } from "./companyRouter";
import { jobSeekerRouter } from "./jobSeekerRouter";
import { getAdminByEmail, getCompanyByEmail, getDb, getJobSeekerByEmail } from "./db";
import { applications, companies, jobSeekers, jobs } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

const suffix = `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
const jobSeekerEmail = `workflow-seeker-${suffix}@example.test`;
const companyEmail = `workflow-company-${suffix}@example.test`;
let testJobSeekerId: number | undefined;
let testCompanyId: number | undefined;

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

afterEach(async () => {
  const db = await getDb();
  if (!db) return;

  if (testJobSeekerId) {
    await db.delete(applications).where(eq(applications.jobSeekerId, testJobSeekerId));
    await db.delete(jobSeekers).where(eq(jobSeekers.id, testJobSeekerId));
  }
  if (testCompanyId) {
    await db.delete(jobs).where(eq(jobs.companyId, testCompanyId));
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  }
});

describe("isolated end-to-end role workflows", () => {
  it("registers and logs in a job seeker, submits then withdraws an application, approves a company, and manages a company job", async () => {
    const publicContext = createContext();
    const jobSeekerPublic = jobSeekerRouter.createCaller(publicContext);
    const companyPublic = companyRouter.createCaller(publicContext);

    const registeredJobSeeker = await jobSeekerPublic.auth.register({
      name: "Workflow Test Seeker",
      email: jobSeekerEmail,
      password: "WorkflowPass123!",
    });
    testJobSeekerId = registeredJobSeeker.jobSeeker.id;
    const jobSeekerLogin = await jobSeekerPublic.auth.login({
      email: jobSeekerEmail,
      password: "WorkflowPass123!",
    });
    expect(jobSeekerLogin.jobSeeker.id).toBe(testJobSeekerId);

    const storedJobSeeker = await getJobSeekerByEmail(jobSeekerEmail);
    expect(storedJobSeeker?.status).toBe("active");
    const jobSeekerCaller = jobSeekerRouter.createCaller(
      createContext({ jobSeeker: storedJobSeeker! })
    );
    const application = await jobSeekerCaller.applications.submit({
      jobId: 13,
      coverLetter: "Temporary integration-test application; removed after validation.",
    });
    expect(application.status).toBe("submitted");
    await expect(jobSeekerCaller.applications.withdraw({ id: application.id })).resolves.toEqual({
      success: true,
    });

    const registeredCompany = await companyPublic.auth.register({
      name: "Workflow Test Company",
      ownerEmail: companyEmail,
      password: "WorkflowPass123!",
      contactName: "Workflow Contact",
      industry: "Testing",
      town: "Remote",
    });
    testCompanyId = registeredCompany.company.id;
    expect(registeredCompany.company.status).toBe("pending");

    const admin = await getAdminByEmail("admin@talentbridgehub.com");
    const adminCaller = adminRouter.createCaller(createContext({ admin: admin! }));
    const approvedCompany = await adminCaller.management.companies.updateStatus({
      id: testCompanyId,
      status: "approved",
    });
    expect(approvedCompany.status).toBe("approved");

    const companyLogin = await companyPublic.auth.login({
      email: companyEmail,
      password: "WorkflowPass123!",
    });
    expect(companyLogin.company.id).toBe(testCompanyId);

    const storedCompany = await getCompanyByEmail(companyEmail);
    const companyCaller = companyRouter.createCaller(createContext({ company: storedCompany! }));
    const createdJob = await companyCaller.jobs.create({
      title: "Temporary Workflow Test Role",
      location: "Remote",
      jobType: "Contract",
      salaryRange: "MMK 500k",
      description: "Temporary integration-test vacancy; removed after validation.",
      categoryId: 1,
    });
    const updatedJob = await companyCaller.jobs.update({
      id: createdJob.id,
      title: "Temporary Workflow Test Role Updated",
    });
    expect(updatedJob.title).toBe("Temporary Workflow Test Role Updated");
    await expect(companyCaller.jobs.delete({ id: createdJob.id })).resolves.toEqual({ success: true });
  }, 20_000);
});
