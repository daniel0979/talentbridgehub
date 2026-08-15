import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getCompanyCookieOptions } from "./_core/cookies";
import {
  COMPANY_COOKIE_NAME,
  hashPassword,
  signCompanySession,
  verifyPassword,
} from "./_core/companyAuth";
import { companyProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCompany,
  createCompanyReview,
  createJob,
  deleteJob,
  getCompanyByEmail,
  getCompanyReviewsByCompany,
getJobsByCompany,
  getAllApprovedJobs,
  updateCompanyProfile,
  updateJob,
  getOrCreateConversation,
  getConversationByCompanyId,
  listMessages,
  sendMessage,
  markConversationMessagesRead,
getUnreadCount,
  getApplicationsByCompany,
  updateApplicationStatus,
  createNotification,
  getNotificationsForRole,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./db";
import { notifyOwner } from "./_core/notification";

const registerSchema = z.object({
  name: z.string().min(1, "Company name is required.").max(255),
  ownerEmail: z.string().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  contactName: z.string().max(255).optional(),
  phone: z.string().max(64).optional(),
  industry: z.string().max(255).optional(),
  town: z.string().max(255).optional(),
description: z.string().optional(),
  website: z.string().max(255).optional(),
  logoUrl: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required.").max(255),
  location: z.string().max(255).optional(),
  jobType: z.string().max(255).optional(),
  salaryRange: z.string().max(255).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  categoryId: z.number().optional(),
});

const updateJobSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255).optional(),
  location: z.string().max(255).optional(),
  jobType: z.string().max(255).optional(),
  salaryRange: z.string().max(255).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  categoryId: z.number().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Company name is required.").max(255).optional(),
  description: z.string().optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  industry: z.string().max(255).optional().nullable(),
  town: z.string().max(255).optional().nullable(),
  phone: z.string().max(64).optional().nullable(),
  contactName: z.string().max(255).optional().nullable(),
});

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1, "Review content is required.").max(2000),
});

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

function publicCompany(company: {
  id: number;
  name: string;
  ownerEmail: string | null;
  contactName: string | null;
  phone: string | null;
  industry: string | null;
  town: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  status: "pending" | "approved" | "suspended";
  createdAt: Date;
}) {
  return {
    id: company.id,
    name: company.name,
    ownerEmail: company.ownerEmail,
    contactName: company.contactName,
    phone: company.phone,
    industry: company.industry,
    town: company.town,
    description: company.description,
    website: company.website,
    logoUrl: company.logoUrl,
    status: company.status,
    createdAt: company.createdAt,
  } as const;
}

export const companyRouter = router({
  auth: router({
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ ctx, input }) => {
        const email = input.ownerEmail.toLowerCase();
        const existing = await getCompanyByEmail(email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        const hashed = await hashPassword(input.password);
        const company = await createCompany({
          name: input.name.trim(),
          ownerEmail: email,
          password: hashed,
          contactName: input.contactName,
          phone: input.phone,
          industry: input.industry,
          town: input.town,
description: input.description,
          website: input.website,
          logoUrl: input.logoUrl,
        });

        const token = await signCompanySession(company);
        const cookieOptions = getCompanyCookieOptions(ctx.req);
        ctx.res.cookie(COMPANY_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE,
        });

        return {
          company: publicCompany(company),
        } as const;
      }),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        const company = await getCompanyByEmail(email);
        if (!company) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        if (!company.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        if (company.status !== "approved") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This company account is not approved yet.",
          });
        }

        const valid = await verifyPassword(input.password, company.password);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        const token = await signCompanySession(company);
        const cookieOptions = getCompanyCookieOptions(ctx.req);
        ctx.res.cookie(COMPANY_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE,
        });

        return {
          company: publicCompany(company),
        } as const;
      }),

    me: publicProcedure.query(async ({ ctx }) => {
      return ctx.company ? publicCompany(ctx.company) : null;
    }),

    notifyAdminPasswordReset: publicProcedure
      .input(
        z.object({
          email: z.string().email("A valid email is required."),
        })
      )
      .mutation(async ({ input }) => {
        const email = input.email.toLowerCase();
        const company = await getCompanyByEmail(email);

        if (company) {
          const content = `${company.name} (${company.ownerEmail}) has forgotten their company password and requested a reset. Please log in to the admin portal -> Notifications and reset their password.`;
          try {
            await notifyOwner({
              title: "Company password reset requested",
              content,
            });
          } catch (error) {
            console.warn(
              "[Company] Failed to notify admin of password reset request:",
              error
            );
          }
          await createNotification({
            recipientRole: "admin",
            recipientId: null,
            title: "Company password reset requested",
            content,
            type: "password_reset",
          });
        }

        return { success: true } as const;
      }),

logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getCompanyCookieOptions(ctx.req);
      ctx.res.clearCookie(COMPANY_COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      return { success: true } as const;
    }),
  }),

  profile: router({
    update: companyProcedure
      .input(updateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        const updated = await updateCompanyProfile(ctx.company.id, input);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Company profile not found.",
          });
        }
        return publicCompany(updated);
      }),
  }),

  jobs: router({
    mine: companyProcedure.query(async ({ ctx }) => {
      return getJobsByCompany(ctx.company.id);
    }),

    all: companyProcedure.query(async () => {
      return getAllApprovedJobs();
    }),

    create: companyProcedure
      .input(createJobSchema)
      .mutation(async ({ ctx, input }) => {
        const job = await createJob({
          companyId: ctx.company.id,
          title: input.title,
          location: input.location,
          jobType: input.jobType,
          salaryRange: input.salaryRange,
          description: input.description,
          responsibilities: input.responsibilities,
          requirements: input.requirements,
          categoryId: input.categoryId,
status: "pending",
        });
        return job;
      }),

    update: companyProcedure
      .input(updateJobSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify ownership — only the owning company can edit its job.
        const mine = await getJobsByCompany(ctx.company.id);
        const owned = mine.some((job) => job.id === input.id);
        if (!owned) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only edit your own job postings.",
          });
        }
        const updated = await updateJob(input.id, input);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found.",
          });
        }
return updated;
      }),

    delete: companyProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const mine = await getJobsByCompany(ctx.company.id);
        const owned = mine.some((job) => job.id === input.id);
        if (!owned) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own job postings.",
          });
        }
await deleteJob(input.id);
        return { success: true } as const;
      }),
  }),

  reviews: router({
    mine: companyProcedure.query(async ({ ctx }) => {
      return getCompanyReviewsByCompany(ctx.company.id);
    }),

create: companyProcedure
      .input(createReviewSchema)
      .mutation(async ({ ctx, input }) => {
        const review = await createCompanyReview({
          companyId: ctx.company.id,
          rating: input.rating,
          content: input.content.trim(),
        });
        return review;
      }),
  }),

  notifications: router({
    list: companyProcedure.query(async ({ ctx }) => {
      return getNotificationsForRole("company", ctx.company.id);
    }),
    unreadCount: companyProcedure.query(async ({ ctx }) => {
      return getNotificationUnreadCount("company", ctx.company.id);
    }),
    markRead: companyProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, "company", ctx.company.id);
        return { success: true } as const;
      }),
    markAllRead: companyProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead("company", ctx.company.id);
      return { success: true } as const;
    }),
  }),

  applications: router({
    /** All applications received for the company's jobs, with seeker info. */
    forCompany: companyProcedure.query(async ({ ctx }) => {
      return getApplicationsByCompany(ctx.company.id);
    }),

    /** Update an application's review status (e.g. shortlist, interview). */
    updateStatus: companyProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "submitted",
            "reviewed",
            "shortlisted",
            "interview",
            "offered",
            "rejected",
          ]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Ensure the application belongs to one of this company's jobs.
        const mine = await getApplicationsByCompany(ctx.company.id);
        const owned = mine.some((app) => app.id === input.id);
        if (!owned) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update applications for your own jobs.",
          });
        }
        const updated = await updateApplicationStatus(input.id, input.status);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found.",
          });
        }
        return updated;
      }),
  }),

  messages: router({
    conversation: companyProcedure.query(async ({ ctx }) => {
      // Company has at most one conversation with the admin.
      const existing = await getConversationByCompanyId(ctx.company.id);
      if (!existing) return null;
      const unread = await getUnreadCount(existing.id, "admin");
      return {
        id: existing.id,
        unread,
      } as const;
    }),

    messages: companyProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversation = await getConversationByCompanyId(ctx.company.id);
        if (!conversation || conversation.id !== input.conversationId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only access your own conversation.",
          });
        }
        return listMessages(input.conversationId);
      }),

    open: companyProcedure.mutation(async ({ ctx }) => {
      const conversation = await getOrCreateConversation(ctx.company.id);
      return conversation;
    }),

    send: companyProcedure
      .input(
        z.object({
          conversationId: z.number(),
          body: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conversation = await getConversationByCompanyId(ctx.company.id);
        if (!conversation || conversation.id !== input.conversationId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only send messages in your own conversation.",
          });
        }
        return sendMessage({
          conversationId: input.conversationId,
          sender: "company",
          body: input.body.trim(),
        });
      }),

    markRead: companyProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await getConversationByCompanyId(ctx.company.id);
        if (!conversation || conversation.id !== input.conversationId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only access your own conversation.",
          });
        }
        // Mark admin-sent messages as read (company read them).
        await markConversationMessagesRead(input.conversationId, "admin");
        return { success: true } as const;
      }),
  }),
});

export type CompanyRouter = typeof companyRouter;
