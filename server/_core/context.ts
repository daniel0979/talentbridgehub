import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Admin, Company, JobSeeker, User } from "../../drizzle/schema";
import { authenticateAdminRequest } from "./adminAuth";
import { authenticateCompanyRequest } from "./companyAuth";
import { authenticateJobSeekerRequest } from "./jobSeekerAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** The verified admin session payload (from the admin cookie), if present. */
  admin: Admin | null;
  /** The verified job seeker session (from the job seeker cookie), if present. */
  jobSeeker: JobSeeker | null;
  /** The verified company session (from the company cookie), if present. */
  company: Company | null;
};

/**
 * Resolve the authenticated admin from the request. The admin session is a
 * separate JWT cookie from the public OAuth session. Returns the full admin
 * row (so role/status are always fresh from the DB) or null.
 */
async function resolveAdmin(
  req: CreateExpressContextOptions["req"]
): Promise<Admin | null> {
  try {
    const payload = await authenticateAdminRequest(req);
    if (!payload) return null;
    const { getAdminById } = await import("../db");
    const admin = await getAdminById(payload.adminId);
    return admin ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the authenticated job seeker from the request. Returns the full
 * job seeker row (so status is always fresh from the DB) or null.
 */
async function resolveJobSeeker(
  req: CreateExpressContextOptions["req"]
): Promise<JobSeeker | null> {
  try {
    const payload = await authenticateJobSeekerRequest(req);
    if (!payload) return null;
    const { getJobSeekerById } = await import("../db");
    const jobSeeker = await getJobSeekerById(payload.jobSeekerId);
    return jobSeeker ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the authenticated company from the request. Returns the full
 * company row (so approval/status is always fresh from the DB) or null.
 */
async function resolveCompany(
  req: CreateExpressContextOptions["req"]
): Promise<Company | null> {
  try {
    const payload = await authenticateCompanyRequest(req);
    if (!payload) return null;
    const { getCompanyById } = await import("../db");
    const company = await getCompanyById(payload.companyId);
    return company ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

const admin = await resolveAdmin(opts.req);
  const jobSeeker = await resolveJobSeeker(opts.req);
  const company = await resolveCompany(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    admin,
    jobSeeker,
    company,
  };
}
