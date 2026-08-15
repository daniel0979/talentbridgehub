CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`target_type` varchar(64) NOT NULL,
	`target_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
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
CREATE TABLE `career_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`cover_image` varchar(512),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `career_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_seekers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(64),
	`location` varchar(255),
	`headline` varchar(255),
	`bio` text,
	`resume_url` varchar(512),
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_seekers_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_seekers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` varchar(512),
	`testimonial_quote` text,
	`display_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `companies` ADD `owner_email` varchar(320);--> statement-breakpoint
ALTER TABLE `companies` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `contact_name` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `phone` varchar(64);--> statement-breakpoint
ALTER TABLE `companies` ADD `industry` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `town` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `status` enum('pending','approved','suspended') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;