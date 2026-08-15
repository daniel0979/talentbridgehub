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
ALTER TABLE `job_seeker_reviews` ADD CONSTRAINT `job_seeker_reviews_job_seeker_id_job_seekers_id_fk` FOREIGN KEY (`job_seeker_id`) REFERENCES `job_seekers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

