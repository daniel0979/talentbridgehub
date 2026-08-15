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

