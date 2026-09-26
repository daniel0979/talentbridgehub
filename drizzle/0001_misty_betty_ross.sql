CREATE TABLE `application_conversations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`application_id` bigint NOT NULL,
	`company_id` bigint NOT NULL,
	`job_seeker_id` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `application_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `application_conversations_application_id_unique` UNIQUE(`application_id`)
);
--> statement-breakpoint
CREATE TABLE `application_messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`conversation_id` bigint NOT NULL,
	`sender_role` enum('company','job_seeker') NOT NULL,
	`body` text NOT NULL,
	`read` enum('unread','read') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `application_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `application_conversations` ADD CONSTRAINT `application_conversations_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_conversations` ADD CONSTRAINT `application_conversations_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_conversations` ADD CONSTRAINT `application_conversations_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_messages` ADD CONSTRAINT `app_msgs_conv_fk` FOREIGN KEY (`conversation_id`) REFERENCES `application_conversations`(`id`) ON DELETE no action ON UPDATE no action;
