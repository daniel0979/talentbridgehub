CREATE TABLE `career_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
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
