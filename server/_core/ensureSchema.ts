import "dotenv/config";
import {
  createConnection,
  type Connection,
  type RowDataPacket,
} from "mysql2/promise";

type CountRow = RowDataPacket & { c: number };

/**
 * Idempotently reconciles the live schema with the columns/tables the app
 * expects. Some databases were created from the raw SQL file or older
 * migrations and are missing columns that newer migrations add (e.g.
 * job_seekers.skills / photo_url / desired_category). Rather than relying
 * solely on the migration journal, we check information_schema and add any
 * missing columns at server startup. Safe to run every boot.
 */
async function tableExists(conn: Connection, table: string): Promise<boolean> {
  const [rows] = await conn.query<CountRow[]>(
    `SELECT COUNT(*) AS c FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return Number(rows[0]?.c) > 0;
}

async function columnExists(
  conn: Connection,
  table: string,
  column: string
): Promise<boolean> {
  const [rows] = await conn.query<CountRow[]>(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0]?.c) > 0;
}

async function addColumnIfMissing(
  conn: Connection,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  if (await columnExists(conn, table, column)) return;
  await conn.query(
    `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
  );
  console.log(`[Schema] Added ${table}.${column}`);
}

async function createTableIfMissing(
  conn: Connection,
  table: string,
  createSql: string
): Promise<void> {
  if (await tableExists(conn, table)) return;
  await conn.query(createSql);
  console.log(`[Schema] Created table ${table}`);
}

export async function ensureSchema(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  let conn: Connection | null = null;
  try {
    conn = await createConnection(databaseUrl);

    // --- job_seekers ---
    if (await tableExists(conn, "job_seekers")) {
      await addColumnIfMissing(conn, "job_seekers", "password", "varchar(255)");
      await addColumnIfMissing(conn, "job_seekers", "phone", "varchar(64)");
      await addColumnIfMissing(conn, "job_seekers", "location", "varchar(255)");
      await addColumnIfMissing(conn, "job_seekers", "headline", "varchar(255)");
      await addColumnIfMissing(conn, "job_seekers", "bio", "text");
      await addColumnIfMissing(conn, "job_seekers", "skills", "text");
      await addColumnIfMissing(conn, "job_seekers", "photo_url", "longtext");
      await addColumnIfMissing(
        conn,
        "job_seekers",
        "desired_category",
        "varchar(255)"
      );
      await addColumnIfMissing(conn, "job_seekers", "resume_url", "varchar(512)");
      await addColumnIfMissing(
        conn,
        "job_seekers",
        "status",
        "enum('active','suspended') DEFAULT 'active' NOT NULL"
      );
      // photo_url must be LONGTEXT (base64 photos exceed MySQL TEXT's 64KB).
      if (await columnExists(conn, "job_seekers", "photo_url")) {
        await conn.query(
          "ALTER TABLE `job_seekers` MODIFY COLUMN `photo_url` LONGTEXT"
        );
      }
    }

    // --- companies (client auth + approval status) ---
    if (await tableExists(conn, "companies")) {
      await addColumnIfMissing(conn, "companies", "owner_email", "varchar(320)");
      await addColumnIfMissing(conn, "companies", "password", "varchar(255)");
      await addColumnIfMissing(conn, "companies", "contact_name", "varchar(255)");
      await addColumnIfMissing(conn, "companies", "phone", "varchar(64)");
      await addColumnIfMissing(conn, "companies", "industry", "varchar(255)");
      await addColumnIfMissing(conn, "companies", "town", "varchar(255)");
await addColumnIfMissing(
        conn,
        "companies",
        "status",
        "enum('pending','approved','suspended') DEFAULT 'pending' NOT NULL"
      );
      await addColumnIfMissing(conn, "companies", "logo_url", "longtext");
      // logo_url must be LONGTEXT (base64 logos exceed varchar(255)).
      if (await columnExists(conn, "companies", "logo_url")) {
        await conn.query(
          "ALTER TABLE `companies` MODIFY COLUMN `logo_url` LONGTEXT"
        );
      }
    }

// --- jobs.status ---
    if (await tableExists(conn, "jobs")) {
      await addColumnIfMissing(
        conn,
        "jobs",
        "status",
        "enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL"
      );
await addColumnIfMissing(conn, "jobs", "salary_band_id", "int");
      await addColumnIfMissing(conn, "jobs", "application_count", "int NOT NULL DEFAULT 0");
      await addColumnIfMissing(conn, "jobs", "responsibilities", "text");
      await addColumnIfMissing(conn, "jobs", "requirements", "text");
    }

// --- career_tips (Career Tips CMS content managed from the admin portal) ---
    await createTableIfMissing(
      conn,
      "career_tips",
      `CREATE TABLE \`career_tips\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`category\` varchar(255) NOT NULL DEFAULT 'Career Growth',
  \`read_time\` varchar(64) NOT NULL DEFAULT '5 min read',
  \`excerpt\` text,
  \`body\` text NOT NULL,
  \`cover_image\` varchar(512),
  \`status\` enum('draft','published') NOT NULL DEFAULT 'draft',
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
    // Handle existing career_tips tables created before the category/read_time/
    // excerpt columns were added — add them if missing.
    if (await tableExists(conn, "career_tips")) {
      await addColumnIfMissing(
        conn,
        "career_tips",
        "category",
        "varchar(255) NOT NULL DEFAULT 'Career Growth'"
      );
      await addColumnIfMissing(
        conn,
        "career_tips",
        "read_time",
        "varchar(64) NOT NULL DEFAULT '5 min read'"
      );
      await addColumnIfMissing(conn, "career_tips", "excerpt", "text");
    }

// --- conversations (admin ↔ company chat threads) ---
    if (await tableExists(conn, "companies")) {
      await createTableIfMissing(
        conn,
        "conversations",
        `CREATE TABLE \`conversations\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`company_id\` int NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`conversations_company_id_unique\` (\`company_id\`),
  KEY \`conversations_company_id_companies_id_fk\` (\`company_id\`),
  CONSTRAINT \`conversations_company_id_companies_id_fk\`
    FOREIGN KEY (\`company_id\`) REFERENCES \`companies\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );

      await createTableIfMissing(
        conn,
        "messages",
        `CREATE TABLE \`messages\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`conversation_id\` int NOT NULL,
  \`sender\` enum('admin','company') NOT NULL,
  \`body\` text NOT NULL,
  \`read\` enum('unread','read') NOT NULL DEFAULT 'unread',
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`messages_conversation_id_conversations_id_fk\` (\`conversation_id\`),
  CONSTRAINT \`messages_conversation_id_conversations_id_fk\`
    FOREIGN KEY (\`conversation_id\`) REFERENCES \`conversations\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
    }

// --- applications (job seeker job applications with resume + cover letter) ---
    if (
      (await tableExists(conn, "job_seekers")) &&
      (await tableExists(conn, "jobs"))
    ) {
      await createTableIfMissing(
        conn,
        "applications",
        `CREATE TABLE \`applications\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`job_seeker_id\` int NOT NULL,
  \`job_id\` int NOT NULL,
  \`company_id\` int NOT NULL,
  \`resume_url\` longtext,
  \`cover_letter\` text,
  \`status\` enum('submitted','reviewed','shortlisted','interview','offered','rejected') NOT NULL DEFAULT 'submitted',
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`applications_job_seeker_id_job_seekers_id_fk\` (\`job_seeker_id\`),
  KEY \`applications_job_id_jobs_id_fk\` (\`job_id\`),
  KEY \`applications_company_id_companies_id_fk\` (\`company_id\`),
  CONSTRAINT \`applications_job_seeker_id_job_seekers_id_fk\`
    FOREIGN KEY (\`job_seeker_id\`) REFERENCES \`job_seekers\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT \`applications_job_id_jobs_id_fk\`
    FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT \`applications_company_id_companies_id_fk\`
    FOREIGN KEY (\`company_id\`) REFERENCES \`companies\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
    }

    // --- company_reviews (testimonials from client companies) ---
    if (await tableExists(conn, "companies")) {
      await createTableIfMissing(
        conn,
        "company_reviews",
        `CREATE TABLE \`company_reviews\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`company_id\` int NOT NULL,
  \`rating\` int NOT NULL,
  \`content\` text NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`company_reviews_company_id_companies_id_fk\` (\`company_id\`),
  CONSTRAINT \`company_reviews_company_id_companies_id_fk\`
    FOREIGN KEY (\`company_id\`) REFERENCES \`companies\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
    }

    // --- notifications (platform-wide, per-role notifications) ---
    await createTableIfMissing(
      conn,
      "notifications",
      `CREATE TABLE \`notifications\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`recipientRole\` enum('admin','job_seeker','company') NOT NULL,
  \`recipient_id\` int,
  \`title\` varchar(255) NOT NULL,
  \`content\` text NOT NULL,
  \`type\` enum('password_reset','application','system') NOT NULL DEFAULT 'system',
  \`is_read\` enum('unread','read') NOT NULL DEFAULT 'unread',
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    // --- job_seeker_reviews (testimonials from job seekers) ---
    if (await tableExists(conn, "job_seekers")) {
      await createTableIfMissing(
        conn,
        "job_seeker_reviews",
        `CREATE TABLE \`job_seeker_reviews\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`job_seeker_id\` int NOT NULL,
  \`rating\` int NOT NULL,
  \`content\` text NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`job_seeker_reviews_job_seeker_id_job_seekers_id_fk\` (\`job_seeker_id\`),
  CONSTRAINT \`job_seeker_reviews_job_seeker_id_job_seekers_id_fk\`
    FOREIGN KEY (\`job_seeker_id\`) REFERENCES \`job_seekers\` (\`id\`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      );
    }
  } catch (error) {
    console.warn("[Schema] ensureSchema failed:", error);
} finally {
    if (conn) await conn.end().catch(() => {});
  }
}
