import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// ---------------------------------------------------------------------------
// Admin Portal procedures (separate `admins` table, email/password auth)
// ---------------------------------------------------------------------------

const requireAdminPortal = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.admin || ctx.admin.status !== 'active') {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      admin: ctx.admin,
    },
  });
});

/**
 * Any authenticated, active admin portal account.
 */
export const adminPortalProcedure = t.procedure.use(requireAdminPortal);

/**
 * Restricted to super_admin portal accounts. Used for Admin Users management.
 */
export const superAdminPortalProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.admin || ctx.admin.status !== 'active') {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    if (ctx.admin.role !== 'super_admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        admin: ctx.admin,
      },
    });
  }),
);

// ---------------------------------------------------------------------------
// Job Seeker procedures (email/password auth, separate `job_seekers` table)
// ---------------------------------------------------------------------------

const requireJobSeeker = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.jobSeeker || ctx.jobSeeker.status !== 'active') {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      jobSeeker: ctx.jobSeeker,
    },
  });
});

/**
 * Any authenticated, active job seeker account.
 */
export const jobSeekerProcedure = t.procedure.use(requireJobSeeker);

// ---------------------------------------------------------------------------
// Company procedures (email/password auth, separate `companies` table)
// ---------------------------------------------------------------------------

const requireCompany = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.company || ctx.company.status !== 'approved') {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      company: ctx.company,
    },
  });
});

/**
 * Any authenticated, approved company account.
 */
export const companyProcedure = t.procedure.use(requireCompany);
