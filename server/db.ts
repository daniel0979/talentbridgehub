import { eq, desc, and, count, like, or, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  jobs,
  companies,
  companyReviews,
  jobSeekerReviews,
  jobCategories,
  admins,
  jobSeekers,
  locations,
activityLogs,
  settings,
  careerTips,
  conversations,
  messages,
  applications,
  notifications,
type Admin,
  type Application,
  type Company,
  type Job,
  type JobSeeker,
  type JobCategory,
  type Location,
  type Setting,
  type Notification,
  type InsertNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { hashPassword } from './_core/adminAuth';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Parse a stored JSON array of strings (e.g. responsibilities/requirements). */
function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function getFeaturedJobs(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        postedAt: jobs.postedAt,
        company: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(jobs.postedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get featured jobs:", error);
    return [];
  }
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        postedAt: jobs.postedAt,
        company: companies.name,
        companyId: companies.id,
        logoUrl: companies.logoUrl,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
        status: jobs.status,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(jobs.id, id), eq(jobs.status, "approved")))
      .limit(1);
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    };
  } catch (error) {
    console.error("[Database] Failed to get job by id:", error);
    return undefined;
  }
}

export async function getJobCategories() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(jobCategories);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get job categories:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Job Categories & Locations CRUD (admin managed)
// ---------------------------------------------------------------------------

export async function createJobCategory(input: {
  name: string;
  icon?: string | null;
}): Promise<JobCategory> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(jobCategories).values({
    name: input.name,
    icon: input.icon ?? null,
  });
  const [row] = await db
    .select()
    .from(jobCategories)
    .where(eq(jobCategories.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create job category");
  }
  return row;
}

export async function updateJobCategory(
  id: number,
  input: { name?: string; icon?: string | null }
): Promise<JobCategory | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const updateSet: Record<string, unknown> = {};
  if (input.name !== undefined) updateSet.name = input.name;
  if (input.icon !== undefined) updateSet.icon = input.icon;
  if (Object.keys(updateSet).length > 0) {
    await db.update(jobCategories).set(updateSet).where(eq(jobCategories.id, id));
  }
  const [row] = await db
    .select()
    .from(jobCategories)
    .where(eq(jobCategories.id, id))
    .limit(1);
  return row;
}

export async function deleteJobCategory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobCategories).where(eq(jobCategories.id, id));
}

export async function createLocation(input: {
  name: string;
  sortOrder?: number;
}): Promise<Location> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(locations).values({
    name: input.name,
    sortOrder: input.sortOrder ?? 0,
  });
  const [row] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create location");
  }
  return row;
}

export async function updateLocation(
  id: number,
  input: { name?: string; sortOrder?: number }
): Promise<Location | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const updateSet: Record<string, unknown> = {};
  if (input.name !== undefined) updateSet.name = input.name;
  if (input.sortOrder !== undefined) updateSet.sortOrder = input.sortOrder;
  if (Object.keys(updateSet).length > 0) {
    await db.update(locations).set(updateSet).where(eq(locations.id, id));
  }
  const [row] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);
  return row;
}

export async function deleteLocation(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(locations).where(eq(locations.id, id));
}

export async function getTopCompanies(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: companies.id,
        name: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(companies)
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get top companies:", error);
    return [];
  }
}

export async function searchJobs(
  keyword?: string,
  location?: string,
  categoryId?: number,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const baseQuery = db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        postedAt: jobs.postedAt,
        company: companies.name,
        companyId: companies.id,
        logoUrl: companies.logoUrl,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id));

const conditions: Parameters<typeof and>[0][] = [
      // Only show approved jobs to the public.
      eq(jobs.status, "approved"),
    ];

    if (categoryId) {
      conditions.push(eq(jobs.categoryId, categoryId));
    }

    // Keyword search across title/company/description.
    if (keyword && keyword.trim() !== "") {
      const kw = `%${keyword.trim()}%`;
      const keywordMatch = or(
        like(jobs.title, kw),
        like(companies.name, kw),
        like(jobs.description, kw)
      );
      if (keywordMatch) conditions.push(keywordMatch);
    }

    // Location search.
    if (location && location.trim() !== "" && location !== "all") {
      const loc = `%${location.trim()}%`;
      const locationMatch = like(jobs.location, loc);
      if (locationMatch) conditions.push(locationMatch);
    }

    const query = baseQuery.where(and(...conditions));

    const result = await query
      .orderBy(desc(jobs.postedAt))
      .limit(limit);
    return result.map((row) => ({
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    }));
  } catch (error) {
    console.error("[Database] Failed to search jobs:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Job seeker data access (email/password auth + profile)
// ---------------------------------------------------------------------------

export async function createJobSeeker(input: {
  name: string;
  email: string;
  password: string;
}): Promise<JobSeeker> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(jobSeekers).values(input);
  const [row] = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create job seeker");
  }
  return row;
}

export async function getJobSeekerByEmail(
  email: string
): Promise<JobSeeker | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getJobSeekerById(
  id: number
): Promise<JobSeeker | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateJobSeekerProfile(
  id: number,
  input: {
    name?: string;
    phone?: string | null;
    location?: string | null;
    headline?: string | null;
    bio?: string | null;
    skills?: string[] | null;
    photoUrl?: string | null;
    desiredCategory?: string | null;
    resumeUrl?: string | null;
  }
): Promise<JobSeeker> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

const updateSet: Record<string, unknown> = {};
  // Coerce empty strings to null so we never store whitespace/empty garbage in
  // optional columns.
  const toNullable = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? null : value ?? null;

  if (input.name !== undefined && input.name.trim() !== "")
    updateSet.name = input.name;
  if (input.phone !== undefined) updateSet.phone = toNullable(input.phone);
  if (input.location !== undefined)
    updateSet.location = toNullable(input.location);
  if (input.headline !== undefined)
    updateSet.headline = toNullable(input.headline);
  if (input.bio !== undefined) updateSet.bio = toNullable(input.bio);
  if (input.desiredCategory !== undefined)
    updateSet.desiredCategory = toNullable(input.desiredCategory);
if (input.photoUrl !== undefined)
    updateSet.photoUrl =
      input.photoUrl && input.photoUrl.trim() !== "" ? input.photoUrl : null;
  if (input.resumeUrl !== undefined)
    updateSet.resumeUrl =
      input.resumeUrl && input.resumeUrl.trim() !== "" ? input.resumeUrl : null;
  if (input.skills !== undefined) {
    const skills = Array.isArray(input.skills)
      ? input.skills.map((s) => s.trim()).filter(Boolean)
      : [];
    updateSet.skills = skills.length > 0 ? JSON.stringify(skills) : null;
  }

  if (Object.keys(updateSet).length > 0) {
    await db
      .update(jobSeekers)
      .set(updateSet)
      .where(eq(jobSeekers.id, id));
  }

  const [row] = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.id, id))
    .limit(1);
  if (!row) {
    throw new Error("Job seeker not found");
  }
  return row;
}

/**
 * Reset (overwrite) a job seeker's password. The plaintext is bcrypt-hashed
 * before it is stored — never stored in plaintext. Used by admins to help a
 * seeker who has forgotten their password.
 */
export async function updateJobSeekerPassword(
  id: number,
  password: string
): Promise<JobSeeker | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const hashed = await hashPassword(password);
  await db
    .update(jobSeekers)
    .set({ password: hashed })
    .where(eq(jobSeekers.id, id));
  const [row] = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.id, id))
    .limit(1);
  return row;
}

// ---------------------------------------------------------------------------
// Company (Client) data access — email/password auth + job management
// ---------------------------------------------------------------------------

export async function createCompany(input: {
  name: string;
  ownerEmail: string;
  password: string;
  contactName?: string;
  phone?: string;
  industry?: string;
  town?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}): Promise<Company> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(companies).values({
    name: input.name,
    ownerEmail: input.ownerEmail,
    password: input.password,
    contactName: input.contactName ?? null,
    phone: input.phone ?? null,
    industry: input.industry ?? null,
    town: input.town ?? null,
    description: input.description ?? null,
website: input.website ?? null,
    logoUrl: input.logoUrl ?? null,
    status: "pending",
  });
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create company");
  }
  return row;
}

export async function getCompanyByEmail(
  email: string
): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.ownerEmail, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyById(
  id: number
): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCompanyProfile(
  id: number,
  input: {
    name?: string;
    description?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    industry?: string | null;
    town?: string | null;
    phone?: string | null;
    contactName?: string | null;
  }
): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const updateSet: Record<string, unknown> = {};
  const toNullable = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? null : value ?? null;

  if (input.name !== undefined && input.name.trim() !== "")
    updateSet.name = input.name.trim();
  if (input.description !== undefined)
    updateSet.description = toNullable(input.description);
  if (input.website !== undefined)
    updateSet.website = toNullable(input.website);
  if (input.logoUrl !== undefined) updateSet.logoUrl = input.logoUrl;
  if (input.industry !== undefined)
    updateSet.industry = toNullable(input.industry);
  if (input.town !== undefined) updateSet.town = toNullable(input.town);
  if (input.phone !== undefined) updateSet.phone = toNullable(input.phone);
  if (input.contactName !== undefined)
    updateSet.contactName = toNullable(input.contactName);

  if (Object.keys(updateSet).length > 0) {
    await db.update(companies).set(updateSet).where(eq(companies.id, id));
  }
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return row;
}

/**
 * Reset (overwrite) a company's password. The plaintext is bcrypt-hashed
 * before it is stored — never stored in plaintext. Used by admins to help a
 * company that has forgotten its password.
 */
export async function updateCompanyPassword(
  id: number,
  password: string
): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const hashed = await hashPassword(password);
  await db
    .update(companies)
    .set({ password: hashed })
    .where(eq(companies.id, id));
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return row;
}

export async function createJob(input: {
  companyId: number;
  title: string;
  location?: string;
  jobType?: string;
  salaryRange?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  categoryId?: number;
  status?: "pending" | "approved" | "rejected";
}): Promise<Job> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(jobs).values({
    companyId: input.companyId,
    title: input.title,
    location: input.location ?? null,
    jobType: input.jobType ?? null,
    salaryRange: input.salaryRange ?? null,
    description: input.description ?? null,
    responsibilities:
      input.responsibilities && input.responsibilities.length > 0
        ? JSON.stringify(input.responsibilities)
        : null,
    requirements:
      input.requirements && input.requirements.length > 0
        ? JSON.stringify(input.requirements)
        : null,
    categoryId: input.categoryId ?? null,
    status: input.status ?? "pending",
    applicationCount: 0,
  });
  const [row] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create job");
  }
  return row;
}

export async function updateJob(
  id: number,
  input: {
    title?: string;
    location?: string;
    jobType?: string;
    salaryRange?: string;
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    categoryId?: number;
  }
): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const updateSet: Record<string, unknown> = {};
  if (input.title !== undefined) updateSet.title = input.title;
  if (input.location !== undefined) updateSet.location = input.location;
  if (input.jobType !== undefined) updateSet.jobType = input.jobType;
  if (input.salaryRange !== undefined) updateSet.salaryRange = input.salaryRange;
  if (input.description !== undefined) updateSet.description = input.description;
  if (input.responsibilities !== undefined) {
    updateSet.responsibilities =
      input.responsibilities.length > 0
        ? JSON.stringify(input.responsibilities)
        : null;
  }
  if (input.requirements !== undefined) {
    updateSet.requirements =
      input.requirements.length > 0
        ? JSON.stringify(input.requirements)
        : null;
  }
  if (input.categoryId !== undefined) updateSet.categoryId = input.categoryId;

  if (Object.keys(updateSet).length > 0) {
    await db.update(jobs).set(updateSet).where(eq(jobs.id, id));
  }
  const [row] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);
  return row;
}

export async function deleteJob(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function getJobsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
        status: jobs.status,
        applicationCount: jobs.applicationCount,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        company: companies.name,
        companyId: companies.id,
        logoUrl: companies.logoUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.companyId, companyId))
      .orderBy(desc(jobs.createdAt));
    return result.map((row) => ({
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    }));
  } catch (error) {
    console.error("[Database] Failed to get jobs by company:", error);
    return [];
  }
}

/** All approved jobs across all companies, joined with company name + logo. */
export async function getAllApprovedJobs() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
        status: jobs.status,
        applicationCount: jobs.applicationCount,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        companyId: companies.id,
        company: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.status, "approved"))
      .orderBy(desc(jobs.createdAt));
    return result.map((row) => ({
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    }));
  } catch (error) {
    console.error("[Database] Failed to get all approved jobs:", error);
    return [];
  }
}

/** All approved jobs for a specific company, joined with company name + logo. */
export async function getApprovedJobsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
        status: jobs.status,
        applicationCount: jobs.applicationCount,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        companyId: companies.id,
        company: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(eq(jobs.companyId, companyId), eq(jobs.status, "approved"))
      )
      .orderBy(desc(jobs.postedAt));
    return result.map((row) => ({
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    }));
  } catch (error) {
    console.error("[Database] Failed to get approved jobs by company:", error);
    return [];
  }
}

/** All jobs across all companies (admin view), joined with company name + logo. */
export async function getAllJobs() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        categoryId: jobs.categoryId,
        status: jobs.status,
        applicationCount: jobs.applicationCount,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        companyId: companies.id,
        company: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(jobs.createdAt));
    return result.map((row) => ({
      ...row,
      responsibilities: parseStringArray(row.responsibilities),
      requirements: parseStringArray(row.requirements),
    }));
  } catch (error) {
    console.error("[Database] Failed to get all jobs:", error);
    return [];
  }
}

export async function updateJobStatus(
  id: number,
  status: "approved" | "rejected"
): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(jobs).set({ status }).where(eq(jobs.id, id));
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return row;
}

/** Approved companies to show on the public Companies page. */
export async function getApprovedCompanies() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: companies.id,
        name: companies.name,
        logoUrl: companies.logoUrl,
        description: companies.description,
        website: companies.website,
        industry: companies.industry,
        town: companies.town,
        status: companies.status,
        createdAt: companies.createdAt,
      })
      .from(companies)
      .where(eq(companies.status, "approved"))
      .orderBy(desc(companies.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get approved companies:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Company reviews (testimonials) data access
// ---------------------------------------------------------------------------

export async function createCompanyReview(input: {
  companyId: number;
  rating: number;
  content: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(companyReviews).values({
    companyId: input.companyId,
    rating: input.rating,
    content: input.content,
  });
  const [row] = await db
    .select()
    .from(companyReviews)
    .where(eq(companyReviews.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create company review");
  }
  return row;
}

/** Public testimonials, joined with the company name/logo. */
export async function getCompanyReviews() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: companyReviews.id,
        companyId: companyReviews.companyId,
        rating: companyReviews.rating,
        content: companyReviews.content,
        createdAt: companyReviews.createdAt,
        companyName: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(companyReviews)
      .innerJoin(companies, eq(companyReviews.companyId, companies.id))
      .orderBy(desc(companyReviews.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get company reviews:", error);
    return [];
  }
}

/** Reviews belonging to a specific company (shown in the company dashboard). */
export async function getCompanyReviewsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: companyReviews.id,
        companyId: companyReviews.companyId,
        rating: companyReviews.rating,
        content: companyReviews.content,
        createdAt: companyReviews.createdAt,
        companyName: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(companyReviews)
      .innerJoin(companies, eq(companyReviews.companyId, companies.id))
      .where(eq(companyReviews.companyId, companyId))
      .orderBy(desc(companyReviews.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get company reviews by company:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Job seeker reviews (testimonials) data access
// ---------------------------------------------------------------------------

export async function createJobSeekerReview(input: {
  jobSeekerId: number;
  rating: number;
  content: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(jobSeekerReviews).values({
    jobSeekerId: input.jobSeekerId,
    rating: input.rating,
    content: input.content,
  });
  const [row] = await db
    .select()
    .from(jobSeekerReviews)
    .where(eq(jobSeekerReviews.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create job seeker review");
  }
  return row;
}

/** Public job seeker testimonials, joined with the seeker's name/photo. */
export async function getJobSeekerReviews() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: jobSeekerReviews.id,
        jobSeekerId: jobSeekerReviews.jobSeekerId,
        rating: jobSeekerReviews.rating,
        content: jobSeekerReviews.content,
        createdAt: jobSeekerReviews.createdAt,
        seekerName: jobSeekers.name,
        photoUrl: jobSeekers.photoUrl,
      })
      .from(jobSeekerReviews)
      .innerJoin(jobSeekers, eq(jobSeekerReviews.jobSeekerId, jobSeekers.id))
      .orderBy(desc(jobSeekerReviews.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get job seeker reviews:", error);
    return [];
  }
}

/** Reviews left by a specific job seeker (shown in their dashboard area). */
export async function getJobSeekerReviewsBySeeker(jobSeekerId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(jobSeekerReviews)
      .where(eq(jobSeekerReviews.jobSeekerId, jobSeekerId))
      .orderBy(desc(jobSeekerReviews.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get job seeker reviews by seeker:", error);
    return [];
  }
}

export async function updateCompanyStatus(
  id: number,
  status: "approved" | "suspended" | "pending"
): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(companies).set({ status }).where(eq(companies.id, id));
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  return row;
}

// ---------------------------------------------------------------------------
// Admin portal data access
// ---------------------------------------------------------------------------

export async function getAdminById(id: number): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAdminByEmail(
  email: string
): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---------------------------------------------------------------------------
// Admin users management (super_admin only)
// ---------------------------------------------------------------------------

export async function getAllAdmins() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(admins)
      .orderBy(desc(admins.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all admins:", error);
    return [];
  }
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}): Promise<Admin> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const hashed = await hashPassword(input.password);
  const [result] = await db.insert(admins).values({
    name: input.name,
    email: input.email.toLowerCase(),
    password: hashed,
    role: input.role,
    status: "active",
  });
  const [row] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create admin user");
  }
  return row;
}

export async function updateAdminStatus(
  id: number,
  status: "active" | "inactive"
): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(admins).set({ status }).where(eq(admins.id, id));
  const [row] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return row;
}

export async function updateAdminRole(
  id: number,
  role: "admin" | "super_admin"
): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(admins).set({ role }).where(eq(admins.id, id));
  const [row] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return row;
}

export async function deleteAdminUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(admins).where(eq(admins.id, id));
}

export async function logActivity(input: {
  adminId: number;
  action: string;
  targetType: string;
  targetId?: number | null;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(activityLogs).values({
      adminId: input.adminId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
    });
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}

export async function getActivityLogs(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const query = db
      .select({
        id: activityLogs.id,
        adminId: activityLogs.adminId,
        action: activityLogs.action,
        targetType: activityLogs.targetType,
        targetId: activityLogs.targetId,
        createdAt: activityLogs.createdAt,
        adminName: admins.name,
      })
      .from(activityLogs)
      .leftJoin(admins, eq(activityLogs.adminId, admins.id))
      .orderBy(desc(activityLogs.createdAt));
    const result = limit !== undefined ? await query.limit(limit) : await query;
    return result;
  } catch (error) {
    console.error("[Database] Failed to get activity logs:", error);
    return [];
  }
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalJobSeekers: 0,
      totalCompanies: 0,
      totalActiveJobs: 0,
      pendingCompanyApprovals: 0,
      signupsOverTime: [] as { month: string; count: number }[],
      jobPostsOverTime: [] as {
        month: string;
        pending: number;
        approved: number;
      }[],
    };
  }
  try {
    const [seekers, companiesCount, activeJobs, pendingCompanies] =
      await Promise.all([
        db.select({ value: count() }).from(jobSeekers),
        db.select({ value: count() }).from(companies),
        db.select({ value: count() }).from(jobs).where(eq(jobs.status, "approved")),
        db
          .select({ value: count() })
          .from(companies)
          .where(eq(companies.status, "pending")),
      ]);

    // --- Signups over time (job seekers by month, last 6 months) ---
    const signupRows = await db
      .select({ createdAt: jobSeekers.createdAt })
      .from(jobSeekers);
    const signupsOverTime = buildMonthlyCounts(signupRows, 6);

    // --- Job posts over time (by month, last 6 months) ---
    const jobRows = await db
      .select({ createdAt: jobs.createdAt, status: jobs.status })
      .from(jobs);
    const now = new Date();
    const buckets: { key: string; pending: number; approved: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        pending: 0,
        approved: 0,
      });
    }
    const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
    for (const row of jobRows) {
      const d = new Date(row.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const idx = bucketIndex.get(key);
      if (idx === undefined) continue;
      if (row.status === "approved") buckets[idx].approved++;
      else if (row.status === "pending") buckets[idx].pending++;
    }
    const jobPostsOverTime = buckets.map((b) => ({
      month: monthLabel(b.key),
      pending: b.pending,
      approved: b.approved,
    }));

    return {
      totalJobSeekers: seekers[0]?.value ?? 0,
      totalCompanies: companiesCount[0]?.value ?? 0,
      totalActiveJobs: activeJobs[0]?.value ?? 0,
      pendingCompanyApprovals: pendingCompanies[0]?.value ?? 0,
      signupsOverTime,
      jobPostsOverTime,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    return {
      totalJobSeekers: 0,
      totalCompanies: 0,
      totalActiveJobs: 0,
      pendingCompanyApprovals: 0,
      signupsOverTime: [] as { month: string; count: number }[],
      jobPostsOverTime: [] as {
        month: string;
        pending: number;
        approved: number;
      }[],
    };
  }
}

function monthLabel(yyyyMm: string): string {
  const [, mm] = yyyyMm.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[parseInt(mm, 10) - 1] ?? yyyyMm;
}

function buildMonthlyCounts(
  rows: { createdAt: Date }[],
  monthsBack: number
): { month: string; count: number }[] {
  const now = new Date();
  const buckets: { key: string; count: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      count: 0,
    });
  }
  const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
  for (const row of rows) {
    const d = new Date(row.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const idx = bucketIndex.get(key);
    if (idx !== undefined) buckets[idx].count++;
  }
  return buckets.map((b) => ({ month: monthLabel(b.key), count: b.count }));
}

export async function getRecentJobSeekers(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(jobSeekers)
      .orderBy(desc(jobSeekers.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get recent job seekers:", error);
    return [];
  }
}

export async function getAllJobSeekers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(jobSeekers)
      .orderBy(desc(jobSeekers.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all job seekers:", error);
    return [];
  }
}

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all companies:", error);
    return [];
  }
}

export async function getRecentJobPosts(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        createdAt: jobs.createdAt,
        company: companies.name,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get recent job posts:", error);
    return [];
  }
}

export async function getLocations() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(locations)
      .orderBy(locations.sortOrder);
  } catch (error) {
    console.error("[Database] Failed to get locations:", error);
    return [];
  }
}

export async function getSettings() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(settings);
  } catch (error) {
    console.error("[Database] Failed to get settings:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Settings & maintenance mode data access
// ---------------------------------------------------------------------------

export async function getSettingValue(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [row] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return row?.value ?? null;
  } catch (error) {
    console.error("[Database] Failed to get setting value:", error);
    return null;
  }
}

export async function upsertSetting(
  key: string,
  value: string
): Promise<Setting> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  if (existing.length > 0) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return row!;
  }
  const [result] = await db.insert(settings).values({ key, value });
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to upsert setting");
  }
  return row;
}

export type NotificationRole = "admin" | "job_seeker" | "company";
export type NotificationType = "password_reset" | "application" | "system";

/**
 * Create a platform notification for a given role. `recipientId` is the target
 * account scoped within that role (pass null for "all admins").
 */
export async function createNotification(input: {
  recipientRole: NotificationRole;
  recipientId?: number | null;
  title: string;
  content: string;
  type?: NotificationType;
}): Promise<Notification | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const [result] = await db.insert(notifications).values({
      recipientRole: input.recipientRole,
      recipientId: input.recipientId ?? null,
      title: input.title,
      content: input.content,
      type: input.type ?? "system",
      isRead: "unread",
    });
    const [row] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, result.insertId))
      .limit(1);
    return row;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    return undefined;
  }
}

/**
 * List notifications for a role. When `recipientId` is null (admin role), all
 * admin notifications are returned. Otherwise, notifications are scoped to a
 * specific recipient (job_seeker or company).
 */
export async function getNotificationsForRole(
  role: NotificationRole,
  recipientId: number | null,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];
  try {
    const conditions: Parameters<typeof and>[0][] = [
      eq(notifications.recipientRole, role),
    ];
    if (recipientId != null) {
      conditions.push(eq(notifications.recipientId, recipientId));
    } else {
      conditions.push(
        role === "admin"
          ? isNull(notifications.recipientId)
          : eq(notifications.recipientId, -1)
      );
    }

    // For tenant-specific roles (job_seeker/company), also include any global
    // notifications targeted at that role without a specific recipient.
    if (role !== "admin" && recipientId != null) {
      return await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientRole, role),
            or(
              eq(notifications.recipientId, recipientId),
              isNull(notifications.recipientId)
            )
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }

    const result =
      recipientId == null && role === "admin"
        ? await db
            .select()
            .from(notifications)
            .where(
              and(
                eq(notifications.recipientRole, role),
                or(
                  isNull(notifications.recipientId),
                  eq(notifications.recipientId, -1)
                )
              )
            )
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
        : await db
            .select()
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

/** Unread notification count for a role + optional recipient. */
export async function getNotificationUnreadCount(
  role: NotificationRole,
  recipientId: number | null
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    if (role === "admin") {
      const result = await db
        .select({ value: count() })
        .from(notifications)
.where(
          and(
            eq(notifications.recipientRole, role),
            eq(notifications.isRead, "unread"),
            isNull(notifications.recipientId)
          )
        );
      return result[0]?.value ?? 0;
    }
    if (recipientId == null) return 0;
    const result = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientRole, role),
          eq(notifications.recipientId, recipientId),
          eq(notifications.isRead, "unread")
        )
      );
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("[Database] Failed to get unread notification count:", error);
    return 0;
  }
}

/** Mark a single notification as read, scoped to the owning role/recipient. */
export async function markNotificationRead(
  id: number,
  role: NotificationRole,
  recipientId: number | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const conditions: Parameters<typeof and>[0][] = [
      eq(notifications.id, id),
      eq(notifications.recipientRole, role),
    ];
if (role === "admin") {
      conditions.push(isNull(notifications.recipientId));
    } else if (recipientId != null) {
      conditions.push(eq(notifications.recipientId, recipientId));
    }
    const result = await db
      .update(notifications)
      .set({ isRead: "read" })
      .where(and(...conditions));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark notification read:", error);
    return false;
  }
}

/** Mark all notifications as read for a role + optional recipient. */
export async function markAllNotificationsRead(
  role: NotificationRole,
  recipientId: number | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const conditions: Parameters<typeof and>[0][] = [
      eq(notifications.recipientRole, role),
      eq(notifications.isRead, "unread"),
    ];
if (role === "admin") {
      conditions.push(isNull(notifications.recipientId));
    } else if (recipientId != null) {
      conditions.push(eq(notifications.recipientId, recipientId));
    }
    await db
      .update(notifications)
      .set({ isRead: "read" })
      .where(and(...conditions));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark all notifications read:", error);
    return false;
  }
}

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  updatedAt: string | null;
};

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const [enabled, message, updatedRow] = await Promise.all([
    getSettingValue("maintenance_enabled"),
    getSettingValue("maintenance_message"),
    getSettingValue("maintenance_updated_at"),
  ]);
  return {
    enabled: enabled === "true",
    message: message ?? "",
    updatedAt: updatedRow,
  };
}

export async function setMaintenanceMode(input: {
  enabled: boolean;
  message: string;
}): Promise<MaintenanceStatus> {
  await Promise.all([
    upsertSetting("maintenance_enabled", String(input.enabled)),
    upsertSetting("maintenance_message", input.message),
    upsertSetting("maintenance_updated_at", new Date().toISOString()),
  ]);
  return getMaintenanceStatus();
}

// ---------------------------------------------------------------------------
// Career Tips CMS data access
// ---------------------------------------------------------------------------

/** Parse the stored JSON body into an array of content paragraphs. */
function parseTipBody(body: string | null): string[] {
  if (!body) return [];
  try {
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    // Fall back to a single paragraph if body isn't valid JSON.
    return body.trim() ? [body] : [];
  }
}

function serializeTip(row: {
  id: number;
  title: string;
  category: string;
  readTime: string;
  excerpt: string | null;
  body: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    readTime: row.readTime,
    excerpt: row.excerpt ?? "",
    content: parseTipBody(row.body),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** All career tips (admin view), newest first. */
export async function getAllCareerTips() {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(careerTips)
      .orderBy(desc(careerTips.createdAt));
    return rows.map(serializeTip);
  } catch (error) {
    console.error("[Database] Failed to get all career tips:", error);
    return [];
  }
}

/** Only published career tips, shown on the public Career Tips page. */
export async function getPublishedCareerTips() {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(careerTips)
      .where(eq(careerTips.status, "published"))
      .orderBy(desc(careerTips.createdAt));
    return rows.map(serializeTip);
  } catch (error) {
    console.error("[Database] Failed to get published career tips:", error);
    return [];
  }
}

export async function createCareerTip(input: {
  title: string;
  category: string;
  readTime: string;
  excerpt?: string;
  content: string[];
  status: "draft" | "published";
}): Promise<ReturnType<typeof serializeTip>> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(careerTips).values({
    title: input.title,
    category: input.category,
    readTime: input.readTime,
    excerpt: input.excerpt ?? null,
    body: JSON.stringify(input.content),
    status: input.status,
  });
  const [row] = await db
    .select()
    .from(careerTips)
    .where(eq(careerTips.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create career tip");
  }
  return serializeTip(row);
}

export async function updateCareerTip(
  id: number,
  input: {
    title?: string;
    category?: string;
    readTime?: string;
    excerpt?: string;
    content?: string[];
    status?: "draft" | "published";
  }
): Promise<ReturnType<typeof serializeTip> | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const updateSet: Record<string, unknown> = {};
  if (input.title !== undefined) updateSet.title = input.title;
  if (input.category !== undefined) updateSet.category = input.category;
  if (input.readTime !== undefined) updateSet.readTime = input.readTime;
  if (input.excerpt !== undefined) updateSet.excerpt = input.excerpt;
  if (input.content !== undefined)
    updateSet.body = JSON.stringify(input.content);
  if (input.status !== undefined) updateSet.status = input.status;

  if (Object.keys(updateSet).length > 0) {
    await db.update(careerTips).set(updateSet).where(eq(careerTips.id, id));
  }
  const [row] = await db
    .select()
    .from(careerTips)
    .where(eq(careerTips.id, id))
    .limit(1);
  return row ? serializeTip(row) : undefined;
}

export async function updateCareerTipStatus(
  id: number,
  status: "draft" | "published"
): Promise<ReturnType<typeof serializeTip> | undefined> {
  return updateCareerTip(id, { status });
}

export async function deleteCareerTip(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(careerTips).where(eq(careerTips.id, id));
}

// ---------------------------------------------------------------------------
// Admin ↔ Company messaging data access
// ---------------------------------------------------------------------------

/** Get the conversation for a company, or create it if it doesn't exist. */
export async function getOrCreateConversation(
  companyId: number
): Promise<{ id: number; companyId: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  let [existing] = await db
    .select({ id: conversations.id, companyId: conversations.companyId })
    .from(conversations)
    .where(eq(conversations.companyId, companyId))
    .limit(1);
  if (!existing) {
    const [result] = await db.insert(conversations).values({ companyId });
    const [row] = await db
      .select({ id: conversations.id, companyId: conversations.companyId })
      .from(conversations)
      .where(eq(conversations.id, result.insertId))
      .limit(1);
    existing = row;
  }
  return existing;
}

/** Get a conversation by company id (returns undefined if none exists). */
export async function getConversationByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.companyId, companyId))
    .limit(1);
  return row;
}

/**
 * All conversations for the admin, joined with company info and a count of
 * unread messages from the company. Newest activity first.
 */
export async function listAdminConversations() {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: conversations.id,
        companyId: conversations.companyId,
        companyName: companies.name,
        logoUrl: companies.logoUrl,
        ownerEmail: companies.ownerEmail,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .innerJoin(companies, eq(conversations.companyId, companies.id))
      .orderBy(desc(conversations.updatedAt));

    const result = [];
    for (const row of rows) {
      const unreadResult = await db
        .select({ value: count() })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, row.id),
            eq(messages.sender, "company"),
            eq(messages.read, "unread")
          )
        );
      result.push({
        id: row.id,
        companyId: row.companyId,
        companyName: row.companyName,
        logoUrl: row.logoUrl,
        ownerEmail: row.ownerEmail,
        updatedAt: row.updatedAt,
        unread: unreadResult[0]?.value ?? 0,
      });
    }
    return result;
  } catch (error) {
    console.error("[Database] Failed to list admin conversations:", error);
    return [];
  }
}

/** Messages for a given conversation, oldest first. */
export async function listMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  } catch (error) {
    console.error("[Database] Failed to list messages:", error);
    return [];
  }
}

/** Count of unread messages sent to the given viewer in a conversation. */
export async function getUnreadCount(
  conversationId: number,
  sender: "admin" | "company"
) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db
      .select({ value: count() })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.sender, sender),
          eq(messages.read, "unread")
        )
      );
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("[Database] Failed to get unread count:", error);
    return 0;
  }
}

/** Insert a new message and return it. */
export async function sendMessage(input: {
  conversationId: number;
  sender: "admin" | "company";
  body: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(messages).values({
    conversationId: input.conversationId,
    sender: input.sender,
    body: input.body,
    read: "unread",
  });
  const [row] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to send message");
  }
  return row;
}

// ---------------------------------------------------------------------------
// Job applications data access
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | "submitted"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "offered"
  | "rejected";

/** Whether a job seeker has already applied to a given job. */
export async function getApplicationByJobSeekerAndJob(
  jobSeekerId: number,
  jobId: number
) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const [row] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.jobSeekerId, jobSeekerId),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);
    return row;
  } catch (error) {
    console.error("[Database] Failed to get application by seeker/job:", error);
    return undefined;
  }
}

/**
 * Create a job application. Increments the owning job's `applicationCount`.
 * Callers should check `getApplicationByJobSeekerAndJob` first to prevent
 * duplicate applications.
 */
export async function createApplication(input: {
  jobSeekerId: number;
  jobId: number;
  companyId: number;
  resumeUrl?: string | null;
  coverLetter?: string | null;
}): Promise<Application> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const [result] = await db.insert(applications).values({
    jobSeekerId: input.jobSeekerId,
    jobId: input.jobId,
    companyId: input.companyId,
    resumeUrl: input.resumeUrl ?? null,
    coverLetter: input.coverLetter ?? null,
    status: "submitted",
  });
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, result.insertId))
    .limit(1);
  if (!row) {
    throw new Error("Failed to create application");
  }
  // Increment the application counter on the job.
  const job = await db
    .select({ count: jobs.applicationCount })
    .from(jobs)
    .where(eq(jobs.id, input.jobId))
    .limit(1);
  if (job[0]) {
    await db
      .update(jobs)
      .set({ applicationCount: (job[0].count ?? 0) + 1 })
      .where(eq(jobs.id, input.jobId));
  }
  return row;
}

/** All applications submitted by a job seeker, joined with job + company info. */
export async function getApplicationsByJobSeeker(jobSeekerId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        jobTitle: jobs.title,
        jobLocation: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        companyId: companies.id,
        companyName: companies.name,
        logoUrl: companies.logoUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .where(eq(applications.jobSeekerId, jobSeekerId))
      .orderBy(desc(applications.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get applications by job seeker:", error);
    return [];
  }
}

/**
 * All applications for jobs owned by a company, joined with seeker profile
 * info. Used by the company dashboard to review applicants.
 */
export async function getApplicationsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        jobSeekerId: applications.jobSeekerId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        jobTitle: jobs.title,
        jobLocation: jobs.location,
        jobType: jobs.jobType,
        salaryRange: jobs.salaryRange,
        companyName: companies.name,
        logoUrl: companies.logoUrl,
        seekerName: jobSeekers.name,
        seekerEmail: jobSeekers.email,
        seekerPhone: jobSeekers.phone,
        seekerHeadline: jobSeekers.headline,
        seekerLocation: jobSeekers.location,
        seekerSkills: jobSeekers.skills,
        seekerPhoto: jobSeekers.photoUrl,
        seekerResume: jobSeekers.resumeUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .where(eq(applications.companyId, companyId))
      .orderBy(desc(applications.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get applications by company:", error);
    return [];
  }
}

/** All applications for a specific job, joined with seeker + company info. */
export async function getApplicationsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: applications.id,
        jobSeekerId: applications.jobSeekerId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        createdAt: applications.createdAt,
        jobTitle: jobs.title,
        companyName: companies.name,
        seekerName: jobSeekers.name,
        seekerEmail: jobSeekers.email,
        seekerHeadline: jobSeekers.headline,
        seekerLocation: jobSeekers.location,
        seekerSkills: jobSeekers.skills,
        seekerPhoto: jobSeekers.photoUrl,
        seekerResume: jobSeekers.resumeUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get applications by job:", error);
    return [];
  }
}

/** All applications across all jobs (admin view), joined with seeker + company. */
export async function getAllApplications() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: applications.id,
        jobSeekerId: applications.jobSeekerId,
        jobId: applications.jobId,
        resumeUrl: applications.resumeUrl,
        coverLetter: applications.coverLetter,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        jobTitle: jobs.title,
        companyName: companies.name,
        seekerName: jobSeekers.name,
        seekerEmail: jobSeekers.email,
        seekerHeadline: jobSeekers.headline,
        seekerLocation: jobSeekers.location,
        seekerSkills: jobSeekers.skills,
        seekerPhoto: jobSeekers.photoUrl,
        seekerResume: jobSeekers.resumeUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .innerJoin(jobSeekers, eq(applications.jobSeekerId, jobSeekers.id))
      .orderBy(desc(applications.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all applications:", error);
    return [];
  }
}

/** Update an application's status in the review pipeline. */
export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus
): Promise<Application | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(applications).set({ status }).where(eq(applications.id, id));
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  return row;
}

/** Mark all messages from `sender` as read in a conversation. */
export async function markConversationMessagesRead(
  conversationId: number,
  sender: "admin" | "company"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(messages)
    .set({ read: "read" })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.sender, sender),
        eq(messages.read, "unread")
      )
    );
}
