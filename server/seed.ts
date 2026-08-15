import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import {
  admins,
  jobCategories,
  locations,
  settings,
} from "../drizzle/schema";
import { hashPassword, verifyPassword } from "./_core/adminAuth";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "admin@talentbridgehub.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

const DEFAULT_CATEGORIES = [
  { name: "Technology", icon: "Code" },
  { name: "Design", icon: "Palette" },
  { name: "Marketing", icon: "Megaphone" },
  { name: "Finance", icon: "DollarSign" },
  { name: "Engineering", icon: "Wrench" },
  { name: "Healthcare", icon: "HeartPulse" },
  { name: "Sales", icon: "TrendingUp" },
  { name: "Education", icon: "GraduationCap" },
  { name: "Human Resources", icon: "Users" },
  { name: "Customer Support", icon: "Headphones" },
];

const DEFAULT_LOCATIONS = [
  "Remote",
  "Yangon",
  "Mandalay",
  "Thanlyin",
  "Shan",
  "Naypyidaw",
  "Taung Gyi",
  "Mawlamyine",
  "Sittwe",
];

const DEFAULT_SETTINGS = [
  { key: "site_name", value: "TalentBridge Hub" },
  { key: "contact_email", value: "contact@talentbridgehub.com" },
  { key: "maintenance_enabled", value: "false" },
  { key: "maintenance_message", value: "" },
  { key: "maintenance_updated_at", value: "" },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }
  if (!SUPER_ADMIN_PASSWORD) {
    throw new Error("SUPER_ADMIN_PASSWORD is required to run the seed script.");
  }
  const db = drizzle(databaseUrl);

  // 1. Seed super admin (idempotent — skip if email already exists).
  const existingAdmin = await db
    .select()
    .from(admins)
    .where(eq(admins.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hashed = await hashPassword(SUPER_ADMIN_PASSWORD);
    await db.insert(admins).values({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: hashed,
      role: "super_admin",
      status: "active",
    });
    console.log(`[Seed] Created super admin: ${SUPER_ADMIN_EMAIL}`);
  } else {
    const currentAdmin = existingAdmin[0];
    if (
      currentAdmin?.role === "super_admin" &&
      (await verifyPassword("password123", currentAdmin.password))
    ) {
      await db
        .update(admins)
        .set({ password: await hashPassword(SUPER_ADMIN_PASSWORD) })
        .where(eq(admins.id, currentAdmin.id));
      console.log(`[Seed] Replaced the inherited default password for ${SUPER_ADMIN_EMAIL}`);
    }
    console.log(`[Seed] Super admin already exists: ${SUPER_ADMIN_EMAIL}`);
  }

  // 2. Seed categories (only insert names that don't exist yet).
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await db
      .select()
      .from(jobCategories)
      .where(eq(jobCategories.name, cat.name))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(jobCategories).values(cat);
    }
  }
  console.log(`[Seed] Categories ensured (${DEFAULT_CATEGORIES.length})`);

  // 3. Seed locations.
  for (let i = 0; i < DEFAULT_LOCATIONS.length; i++) {
    const name = DEFAULT_LOCATIONS[i];
    const existing = await db
      .select()
      .from(locations)
      .where(eq(locations.name, name))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(locations).values({ name, sortOrder: i });
    }
  }
  console.log(`[Seed] Locations ensured (${DEFAULT_LOCATIONS.length})`);

  // 4. Seed settings.
  for (const s of DEFAULT_SETTINGS) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, s.key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values(s);
    }
  }
  console.log(`[Seed] Settings ensured (${DEFAULT_SETTINGS.length})`);

  console.log("[Seed] Done.");
}

main()
  .catch((err) => {
    console.error("[Seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
