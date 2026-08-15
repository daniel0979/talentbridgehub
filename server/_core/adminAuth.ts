import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import type { Admin } from "../../drizzle/schema";
import { ENV } from "./env";

export const ADMIN_COOKIE_NAME = "admin_session_id";
const ADMIN_SESSION_MS = 1000 * 60 * 60 * 24; // 24h

export type AdminSessionPayload = {
  adminId: number;
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

function getAdminSecret() {
  const secret = ENV.adminCookieSecret;
  if (!secret) {
    throw new Error(
      "Admin JWT secret is not configured. Set ADMIN_JWT_SECRET or JWT_SECRET."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a JWT for an authenticated admin. */
export async function signAdminSession(
  admin: Admin
): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ADMIN_SESSION_MS) / 1000);

  return new SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getAdminSecret());
}

/** Verify an admin JWT and extract its payload. */
export async function verifyAdminSession(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAdminSecret(), {
      algorithms: ["HS256"],
    });
    const { adminId, email, name } = payload as Record<string, unknown>;
    if (
      typeof adminId !== "number" ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(name)
    ) {
      return null;
    }
    return { adminId, email, name };
  } catch {
    return null;
  }
}

/** Extract the admin session cookie from a request. */
export async function authenticateAdminRequest(
  req: Request
): Promise<AdminSessionPayload | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const parsed = parseCookieHeader(cookieHeader);
  const token = parsed[ADMIN_COOKIE_NAME];
  if (!token) return null;

  return verifyAdminSession(token);
}
