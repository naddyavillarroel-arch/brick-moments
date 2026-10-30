CREATE TABLE `moments` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`set_number` text,
	`theme` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `moments_date_idx` ON `moments` (`date`);--> statement-breakpoint
CREATE INDEX `moments_updated_idx` ON `moments` (`updated_at`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`moment_id` text NOT NULL,
	`local_path` text NOT NULL,
	`thumb_path` text NOT NULL,
	`remote_key` text,
	`position` integer DEFAULT 0 NOT NULL,
	`width` integer,
	`height` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`moment_id`) REFERENCES `moments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `photos_moment_idx` ON `photos` (`moment_id`);