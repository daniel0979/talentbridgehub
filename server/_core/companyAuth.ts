import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import type { Company } from "../../drizzle/schema";
import { ENV } from "./env";

export const COMPANY_COOKIE_NAME = "company_session_id";
const COMPANY_SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type CompanySessionPayload = {
  companyId: number;
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

function getCompanySecret() {
  const secret = ENV.companyCookieSecret;
  if (!secret) {
    throw new Error(
      "Company JWT secret is not configured. Set COMPANY_JWT_SECRET or JWT_SECRET."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a JWT for an authenticated company. */
export async function signCompanySession(
  company: Company
): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor(
    (issuedAt + COMPANY_SESSION_MS) / 1000
  );

  return new SignJWT({
    companyId: company.id,
    email: company.ownerEmail,
    name: company.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getCompanySecret());
}

/** Verify a company JWT and extract its payload. */
export async function verifyCompanySession(
  token: string | undefined | null
): Promise<CompanySessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getCompanySecret(), {
      algorithms: ["HS256"],
    });
    const { companyId, email, name } = payload as Record<string, unknown>;
    if (
      typeof companyId !== "number" ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(name)
    ) {
      return null;
    }
    return { companyId, email, name };
  } catch {
    return null;
  }
}

/** Extract the company session cookie from a request. */
export async function authenticateCompanyRequest(
  req: Request
): Promise<CompanySessionPayload | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const parsed = parseCookieHeader(cookieHeader);
  const token = parsed[COMPANY_COOKIE_NAME];
  if (!token) return null;

  return verifyCompanySession(token);
}
