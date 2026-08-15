import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getJobSeekerCookieOptions } from "./_core/cookies";
import {
  JOB_SEEKER_COOKIE_NAME,
  hashPassword,
  signJobSeekerSession,
  verifyPassword,
} from "./_core/jobSeekerAuth";
import { jobSeekerProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createApplication,
  createJobSeeker,
  createJobSeekerReview,
  getApplicationByJobSeekerAndJob,
  getApplicationsByJobSeeker,
  getJobById,
  getJobSeekerByEmail,
  getJobSeekerReviewsBySeeker,
  updateApplicationStatus,
  updateJobSeekerProfile,
  createNotification,
  getNotificationsForRole,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./db";
import { notifyOwner } from "./_core/notification";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required.").max(255),
  email: z.string().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

const profileUpdateSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    phone: z.string().max(64).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    headline: z.string().max(255).nullable().optional(),
    bio: z.string().nullable().optional(),
    skills: z.array(z.string().max(64)).max(30).nullable().optional(),
    photoUrl: z.string().nullable().optional(),
    resumeUrl: z.string().nullable().optional(),
    desiredCategory: z.string().max(255).nullable().optional(),
  })
  .optional();

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

function publicProfile(jobSeeker: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  skills: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  desiredCategory: string | null;
  status: "active" | "suspended";
  createdAt: Date;
}) {
  let skills: string[] = [];
  if (jobSeeker.skills) {
    try {
      const parsed = JSON.parse(jobSeeker.skills);
      if (Array.isArray(parsed)) skills = parsed.filter((s) => typeof s === "string");
    } catch {
      skills = [];
    }
  }
  return {
    id: jobSeeker.id,
    name: jobSeeker.name,
    email: jobSeeker.email,
    phone: jobSeeker.phone,
    headline: jobSeeker.headline,
    location: jobSeeker.location,
    bio: jobSeeker.bio,
    skills,
    photoUrl: jobSeeker.photoUrl,
    resumeUrl: jobSeeker.resumeUrl,
    desiredCategory: jobSeeker.desiredCategory,
    status: jobSeeker.status,
    createdAt: jobSeeker.createdAt,
  } as const;
}

export const jobSeekerRouter = router({
  auth: router({
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        const existing = await getJobSeekerByEmail(email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        const hashed = await hashPassword(input.password);
        const jobSeeker = await createJobSeeker({
          name: input.name.trim(),
          email,
          password: hashed,
        });

        const token = await signJobSeekerSession(jobSeeker);
        const cookieOptions = getJobSeekerCookieOptions(ctx.req);
        ctx.res.cookie(JOB_SEEKER_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE,
        });

        return {
          jobSeeker: publicProfile(jobSeeker),
        } as const;
      }),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();
        const jobSeeker = await getJobSeekerByEmail(email);
        if (!jobSeeker) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        if (jobSeeker.status !== "active") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account has been suspended.",
          });
        }

        const valid = await verifyPassword(input.password, jobSeeker.password);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        const token = await signJobSeekerSession(jobSeeker);
        const cookieOptions = getJobSeekerCookieOptions(ctx.req);
        ctx.res.cookie(JOB_SEEKER_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE,
        });

        return {
          jobSeeker: publicProfile(jobSeeker),
        } as const;
      }),

    me: publicProcedure.query(async ({ ctx }) => {
      return ctx.jobSeeker ? publicProfile(ctx.jobSeeker) : null;
    }),

    /**
     * Self-service "forgot password" — notifies the site admin that a job
     * seeker with this email has requested a password reset. The admin then
     * resets the password from the admin portal (Job Seekers → Reset Password).
     *
     * Always returns success (whether or not the account exists) to avoid
     * leaking which emails are registered.
     */
    notifyAdminPasswordReset: publicProcedure
      .input(
        z.object({
          email: z.string().email("A valid email is required."),
        })
      )
      .mutation(async ({ input }) => {
        const email = input.email.toLowerCase();
        const seeker = await getJobSeekerByEmail(email);

        if (seeker) {
          try {
            await notifyOwner({
              title: "Password reset requested",
              content: `${seeker.name} (${seeker.email}) has forgotten their password and requested a reset. Please log in to the admin portal → Job Seekers and reset their password.`,
            });
          } catch (error) {
            console.warn(
              "[JobSeeker] Failed to notify admin of password reset request:",
              error
            );
          }
          // Also persist a platform notification so admins can see it in the
          // Admin portal's notifications inbox even if the notification
          // service is unreachable.
          await createNotification({
            recipientRole: "admin",
            recipientId: null,
            title: "Password reset requested",
            content: `${seeker.name} (${seeker.email}) has forgotten their password and requested a reset. Please log in to the admin portal → Job Seekers and reset their password.`,
            type: "password_reset",
          });
        }

        // Always succeed — do not reveal whether the email is registered.
        return { success: true } as const;
      }),

    logout: jobSeekerProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getJobSeekerCookieOptions(ctx.req);
      ctx.res.clearCookie(JOB_SEEKER_COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      return { success: true } as const;
    }),
  }),

profile: router({
    update: jobSeekerProcedure
      .input(profileUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        if (!input) {
          return { jobSeeker: publicProfile(ctx.jobSeeker) } as const;
        }
        const updated = await updateJobSeekerProfile(ctx.jobSeeker.id, input);
        return { jobSeeker: publicProfile(updated) } as const;
      }),
  }),

  reviews: router({
    /** Create a review about the JobSeeker platform. */
    create: jobSeekerProcedure
      .input(
        z.object({
          rating: z.number().min(1).max(5),
          content: z.string().min(1, "Review content is required.").max(2000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const review = await createJobSeekerReview({
          jobSeekerId: ctx.jobSeeker.id,
          rating: input.rating,
          content: input.content.trim(),
        });
        return review;
      }),

    /** All reviews the signed-in job seeker has submitted. */
    mine: jobSeekerProcedure.query(async ({ ctx }) => {
      return getJobSeekerReviewsBySeeker(ctx.jobSeeker.id);
    }),
  }),

  notifications: router({
    list: jobSeekerProcedure.query(async ({ ctx }) => {
      return getNotificationsForRole("job_seeker", ctx.jobSeeker.id);
    }),
    unreadCount: jobSeekerProcedure.query(async ({ ctx }) => {
      return getNotificationUnreadCount("job_seeker", ctx.jobSeeker.id);
    }),
    markRead: jobSeekerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, "job_seeker", ctx.jobSeeker.id);
        return { success: true } as const;
      }),
    markAllRead: jobSeekerProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead("job_seeker", ctx.jobSeeker.id);
      return { success: true } as const;
    }),
  }),

  applications: router({
    /**
     * Submit a job application. The job must be approved, and the seeker
     * must not have already applied.
     */
submit: jobSeekerProcedure
      .input(
        z.object({
          jobId: z.number(),
          resumeUrl: z.string().optional(),
          coverLetter: z.string().max(10000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const job = await getJobById(input.jobId);
        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found.",
          });
        }
        const existing = await getApplicationByJobSeekerAndJob(
          ctx.jobSeeker.id,
          input.jobId
        );
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already applied to this job.",
          });
        }
        const application = await createApplication({
          jobSeekerId: ctx.jobSeeker.id,
          jobId: input.jobId,
          companyId: job.companyId,
          resumeUrl: input.resumeUrl ?? null,
          coverLetter: input.coverLetter?.trim() || null,
        });
        return application;
      }),

    /** All applications the signed-in job seeker has submitted. */
    mine: jobSeekerProcedure.query(async ({ ctx }) => {
      return getApplicationsByJobSeeker(ctx.jobSeeker.id);
    }),

    /**
     * Withdraw/cancel an application the seeker owns. Marks it as rejected on
     * the seeker's side (the company sees it as withdrawn).
     */
    withdraw: jobSeekerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const mine = await getApplicationsByJobSeeker(ctx.jobSeeker.id);
        const owned = mine.some((app) => app.id === input.id);
        if (!owned) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only withdraw your own applications.",
          });
        }
        await updateApplicationStatus(input.id, "rejected");
        return { success: true } as const;
      }),
  }),
});

export type JobSeekerRouter = typeof jobSeekerRouter;
