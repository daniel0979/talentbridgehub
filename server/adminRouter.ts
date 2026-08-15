import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAdminCookieOptions } from "./_core/cookies";
import {
  ADMIN_COOKIE_NAME,
  signAdminSession,
  verifyPassword,
} from "./_core/adminAuth";
import {
  adminPortalProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import {
  getActivityLogs,
  getAdminByEmail,
  getAllAdmins,
  createAdminUser,
  updateAdminStatus,
  updateAdminRole,
  deleteAdminUser,
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllCareerTips,
  getAllCompanies,
  getAllJobSeekers,
  getAllJobs,
  getDashboardStats,
  getRecentJobPosts,
  getRecentJobSeekers,
  getSettings,
  getMaintenanceStatus,
  setMaintenanceMode,
  logActivity,
  updateCompanyStatus,
  updateJob,
  updateJobStatus,
  deleteJob,
createCareerTip,
  updateCareerTip,
  updateCareerTipStatus,
  deleteCareerTip,
getOrCreateConversation,
  listAdminConversations,
  listMessages,
  sendMessage,
  markConversationMessagesRead,
  getUnreadCount,
  getAllApplications,
  updateApplicationStatus,
  updateJobSeekerPassword,
  updateCompanyPassword,
  createNotification,
  getNotificationsForRole,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./db";
import { superAdminPortalProcedure } from "./_core/trpc";

const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export const adminRouter = router({
  auth: router({
    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ ctx, input }) => {
        const { email, password } = input;
        const admin = await getAdminByEmail(email.toLowerCase());

        if (!admin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        if (admin.status !== "active") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This admin account is inactive.",
          });
        }

        const valid = await verifyPassword(password, admin.password);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        const token = await signAdminSession(admin);
        const cookieOptions = getAdminCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24,
        });

        await logActivity({
          adminId: admin.id,
          action: "login",
          targetType: "admin_session",
        });

        return {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        } as const;
      }),

    me: adminPortalProcedure.query(async ({ ctx }) => {
      const admin = ctx.admin;
      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      } as const;
    }),

    logout: adminPortalProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getAdminCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      if (ctx.admin) {
        await logActivity({
          adminId: ctx.admin.id,
          action: "logout",
          targetType: "admin_session",
        });
      }
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    stats: adminPortalProcedure.query(async () => {
      return getDashboardStats();
    }),

    recentJobSeekers: adminPortalProcedure.query(async () => {
      return getRecentJobSeekers(5);
    }),

    recentJobPosts: adminPortalProcedure.query(async () => {
      return getRecentJobPosts(5);
    }),

activityLogs: adminPortalProcedure.query(async () => {
      return getActivityLogs(10);
    }),
    allActivityLogs: adminPortalProcedure.query(async () => {
      return getActivityLogs();
    }),
  }),

management: router({
    jobSeekers: router({
      list: adminPortalProcedure.query(async () => {
        return getAllJobSeekers();
      }),
      resetPassword: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            password: z
              .string()
              .min(6, "Password must be at least 6 characters."),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const updated = await updateJobSeekerPassword(
            input.id,
            input.password
          );
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Job seeker not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "job_seeker_password_reset",
            targetType: "job_seeker",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    companies: router({
      list: adminPortalProcedure.query(async () => {
        return getAllCompanies();
      }),
      updateStatus: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["approved", "suspended", "pending"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const updated = await updateCompanyStatus(input.id, input.status);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Company not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `company_${input.status}`,
            targetType: "company",
            targetId: input.id,
          });
          return updated;
        }),
      resetPassword: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            password: z
              .string()
              .min(6, "Password must be at least 6 characters."),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const updated = await updateCompanyPassword(input.id, input.password);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Company not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "company_password_reset",
            targetType: "company",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    jobs: router({
      list: adminPortalProcedure.query(async () => {
        return getAllJobs();
      }),
      updateStatus: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["approved", "rejected"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const updated = await updateJobStatus(input.id, input.status);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Job not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `job_${input.status}`,
            targetType: "job",
            targetId: input.id,
          });
          return updated;
        }),
      update: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().min(1).max(255).optional(),
            location: z.string().max(255).optional(),
            jobType: z.string().max(255).optional(),
            salaryRange: z.string().max(255).optional(),
            description: z.string().optional(),
            categoryId: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...rest } = input;
          const updated = await updateJob(id, rest);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Job not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "job_updated",
            targetType: "job",
            targetId: id,
          });
          return updated;
        }),
delete: adminPortalProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteJob(input.id);
          await logActivity({
            adminId: ctx.admin.id,
            action: "job_deleted",
            targetType: "job",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    applications: router({
      list: adminPortalProcedure.query(async () => {
        return getAllApplications();
      }),
      updateStatus: adminPortalProcedure
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
          const updated = await updateApplicationStatus(input.id, input.status);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Application not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `application_${input.status}`,
            targetType: "application",
            targetId: input.id,
          });
          return updated;
        }),
    }),
    careerTips: router({
      list: adminPortalProcedure.query(async () => {
        return getAllCareerTips();
      }),
      create: adminPortalProcedure
        .input(
          z.object({
            title: z.string().min(1).max(255),
            category: z.string().min(1).max(255),
            readTime: z.string().min(1).max(64),
            excerpt: z.string().optional(),
            content: z.array(z.string()).default([]),
            status: z.enum(["draft", "published"]).default("draft"),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const created = await createCareerTip(input);
          await logActivity({
            adminId: ctx.admin.id,
            action: `career_tip_${created.status}`,
            targetType: "career_tip",
            targetId: created.id,
          });
          return created;
        }),
      update: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().min(1).max(255).optional(),
            category: z.string().min(1).max(255).optional(),
            readTime: z.string().min(1).max(64).optional(),
            excerpt: z.string().optional(),
            content: z.array(z.string()).optional(),
            status: z.enum(["draft", "published"]).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...rest } = input;
          const updated = await updateCareerTip(id, rest);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Career tip not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "career_tip_updated",
            targetType: "career_tip",
            targetId: id,
          });
          return updated;
        }),
      updateStatus: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["draft", "published"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const updated = await updateCareerTipStatus(input.id, input.status);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Career tip not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `career_tip_${input.status}`,
            targetType: "career_tip",
            targetId: input.id,
          });
          return updated;
        }),
delete: adminPortalProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteCareerTip(input.id);
          await logActivity({
            adminId: ctx.admin.id,
            action: "career_tip_deleted",
            targetType: "career_tip",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    categories: router({
      list: adminPortalProcedure.query(async () => {
        return getJobCategories();
      }),
      create: adminPortalProcedure
        .input(
          z.object({
            name: z.string().min(1).max(255),
            icon: z.string().max(255).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const created = await createJobCategory(input);
          await logActivity({
            adminId: ctx.admin.id,
            action: "category_created",
            targetType: "job_category",
            targetId: created.id,
          });
          return created;
        }),
      update: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).max(255).optional(),
            icon: z.string().max(255).optional().nullable(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...rest } = input;
          const updated = await updateJobCategory(id, rest);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Category not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "category_updated",
            targetType: "job_category",
            targetId: id,
          });
          return updated;
        }),
      delete: adminPortalProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteJobCategory(input.id);
          await logActivity({
            adminId: ctx.admin.id,
            action: "category_deleted",
            targetType: "job_category",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    locations: router({
      list: adminPortalProcedure.query(async () => {
        return getLocations();
      }),
      create: adminPortalProcedure
        .input(
          z.object({
            name: z.string().min(1).max(255),
            sortOrder: z.number().int().default(0),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const created = await createLocation(input);
          await logActivity({
            adminId: ctx.admin.id,
            action: "location_created",
            targetType: "location",
            targetId: created.id,
          });
          return created;
        }),
      update: adminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).max(255).optional(),
            sortOrder: z.number().int().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...rest } = input;
          const updated = await updateLocation(id, rest);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Location not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: "location_updated",
            targetType: "location",
            targetId: id,
          });
          return updated;
        }),
      delete: adminPortalProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteLocation(input.id);
          await logActivity({
            adminId: ctx.admin.id,
            action: "location_deleted",
            targetType: "location",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
    adminUsers: router({
      list: superAdminPortalProcedure.query(async () => {
        return getAllAdmins();
      }),
      create: superAdminPortalProcedure
        .input(
          z.object({
            name: z.string().min(1).max(255),
            email: z.string().email("A valid email is required."),
            password: z
              .string()
              .min(6, "Password must be at least 6 characters."),
            role: z.enum(["admin", "super_admin"]).default("admin"),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const existing = await getAdminByEmail(input.email.toLowerCase());
          if (existing) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "An admin with this email already exists.",
            });
          }
          const created = await createAdminUser(input);
          await logActivity({
            adminId: ctx.admin.id,
            action: "admin_created",
            targetType: "admin",
            targetId: created.id,
          });
          return created;
        }),
      updateStatus: superAdminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["active", "inactive"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (input.id === ctx.admin.id && input.status === "inactive") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot deactivate your own account.",
            });
          }
          const updated = await updateAdminStatus(input.id, input.status);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Admin user not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `admin_${input.status}`,
            targetType: "admin",
            targetId: input.id,
          });
          return updated;
        }),
      updateRole: superAdminPortalProcedure
        .input(
          z.object({
            id: z.number(),
            role: z.enum(["admin", "super_admin"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (input.id === ctx.admin.id && input.role !== "super_admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot demote your own account.",
            });
          }
          const updated = await updateAdminRole(input.id, input.role);
          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Admin user not found.",
            });
          }
          await logActivity({
            adminId: ctx.admin.id,
            action: `admin_role_${input.role}`,
            targetType: "admin",
            targetId: input.id,
          });
          return updated;
        }),
      delete: superAdminPortalProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (input.id === ctx.admin.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot delete your own account.",
            });
          }
          await deleteAdminUser(input.id);
          await logActivity({
            adminId: ctx.admin.id,
            action: "admin_deleted",
            targetType: "admin",
            targetId: input.id,
          });
          return { success: true } as const;
        }),
    }),
  }),

messages: router({
    conversations: adminPortalProcedure.query(async () => {
      return listAdminConversations();
    }),

    messages: adminPortalProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return listMessages(input.conversationId);
      }),

    open: adminPortalProcedure
      .input(
        z.object({
          companyId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const conversation = await getOrCreateConversation(input.companyId);
        return conversation;
      }),

    send: adminPortalProcedure
      .input(
        z.object({
          conversationId: z.number(),
          body: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const message = await sendMessage({
          conversationId: input.conversationId,
          sender: "admin",
          body: input.body.trim(),
        });
        await logActivity({
          adminId: ctx.admin.id,
          action: "message_sent",
          targetType: "message",
          targetId: message.id,
        });
        return message;
      }),

    markRead: adminPortalProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        // Mark company-sent messages as read (admin read them).
        await markConversationMessagesRead(input.conversationId, "company");
        return { success: true } as const;
      }),

    unread: adminPortalProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return getUnreadCount(input.conversationId, "company");
      }),
  }),

notifications: router({
    list: adminPortalProcedure.query(async () => {
      return getNotificationsForRole("admin", null);
    }),
    unreadCount: adminPortalProcedure.query(async () => {
      return getNotificationUnreadCount("admin", null);
    }),
    markRead: adminPortalProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, "admin", null);
        await logActivity({
          adminId: ctx.admin.id,
          action: "notification_read",
          targetType: "notification",
          targetId: input.id,
        });
        return { success: true } as const;
      }),
    markAllRead: adminPortalProcedure.mutation(async () => {
      await markAllNotificationsRead("admin", null);
      return { success: true } as const;
    }),
  }),

settings: router({
    list: adminPortalProcedure.query(async () => {
      return getSettings();
    }),
    maintenance: router({
      get: adminPortalProcedure.query(async () => {
        return getMaintenanceStatus();
      }),
      update: adminPortalProcedure
        .input(
          z.object({
            enabled: z.boolean(),
            message: z.string().max(2000).default(""),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const status = await setMaintenanceMode({
            enabled: input.enabled,
            message: input.message,
          });
          await logActivity({
            adminId: ctx.admin.id,
            action: input.enabled ? "maintenance_enabled" : "maintenance_disabled",
            targetType: "settings",
          });
          return status;
        }),
    }),
  }),
});

export type AdminRouter = typeof adminRouter;
