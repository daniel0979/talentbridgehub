import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { jobSeekerRouter } from "./jobSeekerRouter";
import { companyRouter } from "./companyRouter";
import { getApprovedCompanies, getApprovedJobsByCompany, getCompanyReviews, getFeaturedJobs, getJobById, getJobCategories, getJobSeekerReviews, getTopCompanies, searchJobs, getPublishedCareerTips } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  jobSeeker: jobSeekerRouter,
  company: companyRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jobs: router({
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(6) }).optional())
      .query(async ({ input }) => {
        return getFeaturedJobs(input?.limit ?? 6);
      }),
    search: publicProcedure
      .input(
        z.object({
          keyword: z.string().optional(),
          location: z.string().optional(),
          categoryId: z.number().optional(),
          limit: z.number().default(20),
        }).optional()
      )
      .query(async ({ input }) => {
        return searchJobs(
          input?.keyword,
          input?.location,
          input?.categoryId,
          input?.limit ?? 20
        );
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getJobById(input.id);
      }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return getJobCategories();
    }),
  }),

  companies: router({
    top: publicProcedure
      .input(z.object({ limit: z.number().default(6) }).optional())
      .query(async ({ input }) => {
        return getTopCompanies(input?.limit ?? 6);
      }),
    all: publicProcedure.query(async () => {
      return getApprovedCompanies();
    }),
    jobs: publicProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return getApprovedJobsByCompany(input.companyId);
      }),
reviews: publicProcedure.query(async () => {
      return getCompanyReviews();
    }),
  }),

  careerTips: router({
    list: publicProcedure.query(async () => {
      return getPublishedCareerTips();
    }),
  }),

  jobSeekerReviews: router({
    list: publicProcedure.query(async () => {
      return getJobSeekerReviews();
    }),
  }),
});

export type AppRouter = typeof appRouter;
