import {
  bigint,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing the Manus OAuth auth flow (job seekers and the
 * general public). The Admin portal uses a separate `admins` table with
 * email/password auth instead.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin portal accounts. No self-registration — only a super_admin can create
 * new admin accounts. Passwords are hashed with bcrypt, never stored in
 * plaintext.
 */
export const admins = mysqlTable("admins", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "super_admin"]).default("admin").notNull(),
  status: mysqlEnum("status", ["active", "inactive"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Job seekers registered on the platform. Authenticated with email/password
 * (separate from the Manus OAuth `users` table). Managed
 * (suspend/reactivate/delete) from the Admin portal.
 */
export const jobSeekers = mysqlTable("job_seekers", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  location: varchar("location", { length: 255 }),
  headline: varchar("headline", { length: 255 }),
  bio: text("bio"),
  skills: text("skills"), // JSON array of skill tags
  photoUrl: longtext("photo_url"), // base64 data URL or storage path (LONGTEXT: base64 photos exceed MySQL TEXT's 64KB)
  desiredCategory: varchar("desired_category", { length: 255 }),
  resumeUrl: varchar("resume_url", { length: 512 }),
  status: mysqlEnum("status", ["active", "suspended"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobSeeker = typeof jobSeekers.$inferSelect;
export type InsertJobSeeker = typeof jobSeekers.$inferInsert;

/**
 * Companies / Clients. New signups start as `pending` and must be approved by
 * an admin before they can post jobs.
 */
export const companies = mysqlTable("companies", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // LONGTEXT: base64 logos can exceed MySQL TEXT's 64KB.
  logoUrl: longtext("logo_url"),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  ownerEmail: varchar("owner_email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  industry: varchar("industry", { length: 255 }),
  town: varchar("town", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "suspended"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Testimonials / reviews left by client companies about their experience
 * hiring on JobSeeker. Shown publicly on the Companies page under "Partner
 * Testimonials". `rating` is a 1–5 star score and `content` is the review text.
 */
export const companyReviews = mysqlTable("company_reviews", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  companyId: bigint("company_id", { mode: "number" })
    .references(() => companies.id)
    .notNull(),
  rating: int("rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyReview = typeof companyReviews.$inferSelect;
export type InsertCompanyReview = typeof companyReviews.$inferInsert;

/**
 * Reviews / testimonials left by job seekers about their experience using
 * JobSeeker. Shown publicly on the home page under "Success Stories".
 * `rating` is a 1–5 star score and `content` is the review text.
 */
export const jobSeekerReviews = mysqlTable("job_seeker_reviews", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  jobSeekerId: bigint("job_seeker_id", { mode: "number" })
    .references(() => jobSeekers.id)
    .notNull(),
  rating: int("rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobSeekerReview = typeof jobSeekerReviews.$inferSelect;
export type InsertJobSeekerReview = typeof jobSeekerReviews.$inferInsert;

export const jobCategories = mysqlTable("job_categories", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }), // Storing icon name or URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobCategory = typeof jobCategories.$inferSelect;
export type InsertJobCategory = typeof jobCategories.$inferInsert;

/**
 * Locations / towns used for job filter dropdowns.
 */
export const locations = mysqlTable("locations", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * Salary bands used for job filter dropdowns (managed by admin CRUD).
 */
export const salaryBands = mysqlTable("salary_bands", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull().unique(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalaryBand = typeof salaryBands.$inferSelect;
export type InsertSalaryBand = typeof salaryBands.$inferInsert;

/**
 * Job postings. `companyId` is the owning client. New posts start as
 * `pending` and are approved/rejected by an admin.
 */
export const jobs = mysqlTable("jobs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  companyId: bigint("company_id", { mode: "number" })
    .references(() => companies.id)
    .notNull(),
  location: varchar("location", { length: 255 }),
  jobType: varchar("job_type", { length: 255 }),
  salaryRange: varchar("salary_range", { length: 255 }),
  description: text("description"),
  /** JSON array of key responsibilities for the role. */
  responsibilities: text("responsibilities"),
  /** JSON array of job requirements. */
  requirements: text("requirements"),
  categoryId: bigint("category_id", { mode: "number" }).references(() => jobCategories.id),
  salaryBandId: bigint("salary_band_id", { mode: "number" }).references(() => salaryBands.id),
  status: mysqlEnum("status", ["pending", "approved", "rejected"])
    .default("pending")
    .notNull(),
  /** Number of job seekers who have applied to this job. Visible to the
   * owning company and admins only. */
  applicationCount: int("application_count").default(0).notNull(),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Job applications submitted by job seekers to jobs posted by companies.
 * Stores the seeker's resume (base64 data URL) and cover letter. `status`
 * tracks the application lifecycle as the company reviews it.
 */
export const applications = mysqlTable("applications", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  jobSeekerId: bigint("job_seeker_id", { mode: "number" })
    .references(() => jobSeekers.id)
    .notNull(),
  jobId: bigint("job_id", { mode: "number" })
    .references(() => jobs.id)
    .notNull(),
  companyId: bigint("company_id", { mode: "number" })
    .references(() => companies.id)
    .notNull(),
  // LONGTEXT: base64 resumes can exceed MySQL TEXT's 64KB.
  resumeUrl: longtext("resume_url"),
  coverLetter: text("cover_letter"),
  status: mysqlEnum("status", [
    "submitted",
    "reviewed",
    "shortlisted",
    "interview",
    "offered",
    "rejected",
  ])
    .default("submitted")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Career tips CMS content managed from the Admin portal.
 */
export const careerTips = mysqlTable("career_tips", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull().default("Career Growth"),
  readTime: varchar("read_time", { length: 64 }).notNull().default("5 min read"),
  excerpt: text("excerpt"),
  /** The tip's content paragraphs, stored as a JSON array of strings. */
  body: text("body").notNull(),
  coverImage: varchar("cover_image", { length: 512 }),
  status: mysqlEnum("status", ["draft", "published"])
    .default("draft")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CareerTip = typeof careerTips.$inferSelect;
export type InsertCareerTip = typeof careerTips.$inferInsert;

/**
 * A private chat thread between the admin portal and a single company
 * (client) account. Each company has at most one conversation with the admin.
 */
export const conversations = mysqlTable("conversations", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  companyId: bigint("company_id", { mode: "number" })
    .references(() => companies.id)
    .notNull()
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Individual messages in a conversation. `sender` indicates whether the
 * message came from the admin or the company. `read` tracks whether the
 * receiving side has seen it.
 */
export const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  conversationId: bigint("conversation_id", { mode: "number" })
    .references(() => conversations.id)
    .notNull(),
  sender: mysqlEnum("sender", ["admin", "company"]).notNull(),
  body: text("body").notNull(),
  read: mysqlEnum("read", ["unread", "read"]).default("unread").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Partner companies showcased on the public Companies page (logos +
 * testimonials). Separate from the `companies` table — not every registered
 * company is a showcased partner.
 */
export const partnerCompanies = mysqlTable("partner_companies", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: varchar("logo", { length: 512 }),
  testimonialQuote: text("testimonial_quote"),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerCompany = typeof partnerCompanies.$inferSelect;
export type InsertPartnerCompany = typeof partnerCompanies.$inferInsert;

/**
 * Audit trail of admin actions (who approved/rejected/deleted what, and when).
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  adminId: bigint("admin_id", { mode: "number" })
    .references(() => admins.id)
    .notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("target_type", { length: 64 }).notNull(),
  targetId: bigint("target_id", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Notifications delivered to a specific role (admin portal, job seeker, or
 * company). `recipientId` identifies the target account within that role
 * (null for "all admins"). Created for system events such as forgot-password
 * requests, application status changes, and new applicants.
 */
export const notifications = mysqlTable("notifications", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  recipientRole: mysqlEnum("recipientRole", ["admin", "job_seeker", "company"])
    .notNull(),
  recipientId: bigint("recipient_id", { mode: "number" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["password_reset", "application", "system"])
    .default("system")
    .notNull(),
  isRead: mysqlEnum("is_read", ["unread", "read"]).default("unread").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Simple key/value site-wide settings (site name, contact email, etc.).
 */
export const settings = mysqlTable("settings", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
