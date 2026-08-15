CREATE TABLE `salary_bands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salary_bands_id` PRIMARY KEY(`id`),
	CONSTRAINT `salary_bands_label_unique` UNIQUE(`label`)
);
--> statement-breakpoint
ALTER TABLE `job_seekers` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `job_seekers` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `job_seekers` ADD `photo_url` text;--> statement-breakpoint
ALTER TABLE `job_seekers` ADD `desired_category` varchar(255);