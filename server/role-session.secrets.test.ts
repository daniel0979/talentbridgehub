import { describe, expect, it } from "vitest";
import { signAdminSession, verifyAdminSession } from "./_core/adminAuth";
import { signCompanySession, verifyCompanySession } from "./_core/companyAuth";
import { signJobSeekerSession, verifyJobSeekerSession } from "./_core/jobSeekerAuth";

describe("production role-session secrets", () => {
  it("signs and verifies an administrator session", async () => {
    const token = await signAdminSession({
      id: 101,
      name: "Test Administrator",
      email: "administrator@example.com",
      password: "hash",
      role: "super_admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(verifyAdminSession(token)).resolves.toMatchObject({
      adminId: 101,
      email: "administrator@example.com",
    });
  });

  it("signs and verifies a job-seeker session", async () => {
    const token = await signJobSeekerSession({
      id: 102,
      name: "Test Job Seeker",
      email: "seeker@example.com",
      password: "hash",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: null,
      location: null,
      headline: null,
      bio: null,
      skills: null,
      photoUrl: null,
      desiredCategory: null,
      resumeUrl: null,
    });

    await expect(verifyJobSeekerSession(token)).resolves.toMatchObject({
      jobSeekerId: 102,
      email: "seeker@example.com",
    });
  });

  it("signs and verifies a company session", async () => {
    const token = await signCompanySession({
      id: 103,
      name: "Test Company",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
      logoUrl: null,
      description: null,
      website: null,
      ownerEmail: "company@example.com",
      password: "hash",
      contactName: null,
      phone: null,
      industry: null,
      town: null,
    });

    await expect(verifyCompanySession(token)).resolves.toMatchObject({
      companyId: 103,
      email: "company@example.com",
    });
  });
});
