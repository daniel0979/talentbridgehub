CREATE TABLE `activity_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`admin_id` bigint NOT NULL,
	`action` varchar(255) NOT NULL,
	`target_type` varchar(64) NOT NULL,
	`target_id` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admins` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','super_admin') NOT NULL DEFAULT 'admin',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`job_seeker_id` bigint NOT NULL,
	`job_id` bigint NOT NULL,
	`company_id` bigint NOT NULL,
	`resume_url` longtext,
	`cover_letter` text,
	`status` enum('submitted','reviewed','shortlisted','interview','offered','rejected') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_tips` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL DEFAULT 'Career Growth',
	`read_time` varchar(64) NOT NULL DEFAULT '5 min read',
	`excerpt` text,
	`body` text NOT NULL,
	`cover_image` varchar(512),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `career_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo_url` longtext,
	`description` text,
	`website` varchar(255),
	`owner_email` varchar(320),
	`password` varchar(255),
	`contact_name` varchar(255),
	`phone` varchar(64),
	`industry` varchar(255),
	`town` varchar(255),
	`status` enum('pending','approved','suspended') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_reviews` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_company_id_unique` UNIQUE(`company_id`)
);
--> statement-breakpoint
CREATE TABLE `job_categories` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_seeker_reviews` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`job_seeker_id` bigint NOT NULL,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_seeker_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_seekers` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(64),
	`location` varchar(255),
	`headline` varchar(255),
	`bio` text,
	`skills` text,
	`photo_url` longtext,
	`desired_category` varchar(255),
	`resume_url` varchar(512),
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_seekers_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_seekers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`company_id` bigint NOT NULL,
	`location` varchar(255),
	`job_type` varchar(255),
	`salary_range` varchar(255),
	`description` text,
	`responsibilities` text,
	`requirements` text,
	`category_id` bigint,
	`salary_band_id` bigint,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`application_count` int NOT NULL DEFAULT 0,
	`posted_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`conversation_id` bigint NOT NULL,
	`sender` enum('admin','company') NOT NULL,
	`body` text NOT NULL,
	`read` enum('unread','read') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`recipientRole` enum('admin','job_seeker','company') NOT NULL,
	`recipient_id` bigint,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('password_reset','application','system') NOT NULL DEFAULT 'system',
	`is_read` enum('unread','read') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_companies` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` varchar(512),
	`testimonial_quote` text,
	`display_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salary_bands` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salary_bands_id` PRIMARY KEY(`id`),
	CONSTRAINT `salary_bands_label_unique` UNIQUE(`label`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_reviews` ADD CONSTRAINT `company_reviews_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_seeker_reviews` ADD CONSTRAINT `job_seeker_reviews_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_category_id_job_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `job_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_salary_band_id_salary_bands_id_fk` FOREIGN KEY (`salary_band_id`) REFERENCES `salary_bands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE no action ON UPDATE no action;