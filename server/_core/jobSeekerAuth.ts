import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import type { JobSeeker } from "../../drizzle/schema";
import { ENV } from "./env";

export const JOB_SEEKER_COOKIE_NAME = "job_seeker_session_id";
const JOB_SEEKER_SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type JobSeekerSessionPayload = {
  jobSeekerId: number;
  email: string;
  name: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const BCRYPT_ROUNDS = 10;

/** Hash a plaintext password with bcrypt (never stored in plaintext). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Compare a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getJobSeekerSecret() {
  const secret = ENV.jobSeekerCookieSecret;
  if (!secret) {
    throw new Error(
      "Job seeker JWT secret is not configured. Set JOB_SEEKER_JWT_SECRET or JWT_SECRET."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a JWT for an authenticated job seeker. */
export async function signJobSeekerSession(
  jobSeeker: JobSeeker
): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor(
    (issuedAt + JOB_SEEKER_SESSION_MS) / 1000
  );

  return new SignJWT({
    jobSeekerId: jobSeeker.id,
    email: jobSeeker.email,
    name: jobSeeker.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getJobSeekerSecret());
}

/** Verify a job seeker JWT and extract its payload. */
export async function verifyJobSeekerSession(
  token: string | undefined | null
): Promise<JobSeekerSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJobSeekerSecret(), {
      algorithms: ["HS256"],
    });
    const { jobSeekerId, email, name } = payload as Record<string, unknown>;
    if (
      typeof jobSeekerId !== "number" ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(name)
    ) {
      return null;
    }
    return { jobSeekerId, email, name };
  } catch {
    return null;
  }
}

/** Extract the job seeker session cookie from a request. */
export async function authenticateJobSeekerRequest(
  req: Request
): Promise<JobSeekerSessionPayload | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const parsed = parseCookieHeader(cookieHeader);
  const token = parsed[JOB_SEEKER_COOKIE_NAME];
  if (!token) return null;

  return verifyJobSeekerSession(token);
}
