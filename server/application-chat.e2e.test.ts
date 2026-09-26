import { afterEach, describe, expect, it } from "vitest";
import { and, eq, gte } from "drizzle-orm";
import { companyRouter } from "./companyRouter";
import { jobSeekerRouter } from "./jobSeekerRouter";
import {
  getApplicationsByCompany,
  getCompanyById,
  getDb,
  getJobSeekerById,
} from "./db";
import { applicationConversations, applicationMessages, notifications } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

let conversationId: number | undefined;
const testStartedAt = new Date();

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
  if (!db || !conversationId) return;
  await db.delete(applicationMessages).where(eq(applicationMessages.conversationId, conversationId));
  await db.delete(applicationConversations).where(eq(applicationConversations.id, conversationId));
  await db.delete(notifications).where(
    and(eq(notifications.type, "application"), gte(notifications.createdAt, testStartedAt))
  );
  conversationId = undefined;
});

describe("application chat workflow", () => {
  it("lets a company initiate a private application chat and the job seeker reply", async () => {
    const company = await getCompanyById(7);
    const jobSeeker = await getJobSeekerById(2);
    const application = (await getApplicationsByCompany(7)).find(
      (item) => item.jobSeekerId === jobSeeker?.id
    );
    expect(company?.status).toBe("approved");
    expect(jobSeeker?.status).toBe("active");
    expect(application).toBeDefined();

    const companyCaller = companyRouter.createCaller(createContext({ company: company! }));
    const seekerCaller = jobSeekerRouter.createCaller(createContext({ jobSeeker: jobSeeker! }));

    const opened = await companyCaller.applications.chat.open({ applicationId: application!.id });
    conversationId = opened.id;
    expect(opened.applicationId).toBe(application!.id);
    expect(opened.companyId).toBe(company!.id);
    expect(opened.jobSeekerId).toBe(jobSeeker!.id);

    const firstMessage = await companyCaller.applications.chat.send({
      applicationId: application!.id,
      body: "We would like to discuss your application. Are you available this week?",
    });
    expect(firstMessage.senderRole).toBe("company");

    const seekerMessages = await seekerCaller.applications.chat.messages({
      applicationId: application!.id,
    });
    expect(seekerMessages).toHaveLength(1);
    expect(seekerMessages[0].body).toContain("discuss your application");

    const summaries = await seekerCaller.applications.chat.list();
    expect(summaries.some((chat) => chat.applicationId === application!.id)).toBe(true);

    const reply = await seekerCaller.applications.chat.send({
      applicationId: application!.id,
      body: "Thank you. I am available on Thursday afternoon.",
    });
    expect(reply.senderRole).toBe("job_seeker");

    const companyMessages = await companyCaller.applications.chat.messages({
      applicationId: application!.id,
    });
    expect(companyMessages).toHaveLength(2);
    expect(companyMessages[1].body).toContain("Thursday afternoon");

    await expect(
      companyCaller.applications.chat.open({ applicationId: 999999999 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      seekerCaller.applications.chat.messages({ applicationId: 999999999 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  }, 20_000);
});
