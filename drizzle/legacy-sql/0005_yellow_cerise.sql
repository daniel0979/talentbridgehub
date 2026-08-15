CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_seeker_id` int NOT NULL,
	`job_id` int NOT NULL,
	`company_id` int NOT NULL,
	`resume_url` longtext,
	`cover_letter` text,
	`status` enum('submitted','reviewed','shortlisted','interview','offered','rejected') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_company_id_unique` UNIQUE(`company_id`)
);
--> statement-breakpoint
CREATE TABLE `job_seeker_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_seeker_id` int NOT NULL,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_seeker_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`sender` enum('admin','company') NOT NULL,
	`body` text NOT NULL,
	`read` enum('unread','read') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientRole` enum('admin','job_seeker','company') NOT NULL,
	`recipient_id` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('password_reset','application','system') NOT NULL DEFAULT 'system',
	`is_read` enum('unread','read') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `companies` MODIFY COLUMN `logo_url` longtext;--> statement-breakpoint
ALTER TABLE `career_tips` ADD `category` varchar(255) DEFAULT 'Career Growth' NOT NULL;--> statement-breakpoint
ALTER TABLE `career_tips` ADD `read_time` varchar(64) DEFAULT '5 min read' NOT NULL;--> statement-breakpoint
ALTER TABLE `career_tips` ADD `excerpt` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `responsibilities` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `requirements` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `application_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_reviews` ADD CONSTRAINT `company_reviews_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_seeker_reviews` ADD CONSTRAINT `job_seeker_reviews_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE no action ON UPDATE no action;