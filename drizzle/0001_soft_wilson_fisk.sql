CREATE TABLE `word_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`word_key` text NOT NULL,
	`word_label` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`moderation_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `word_comments_word_status_created_idx` ON `word_comments` (`word_key`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `word_comments_moderation_created_idx` ON `word_comments` (`moderation_key`,`created_at`);