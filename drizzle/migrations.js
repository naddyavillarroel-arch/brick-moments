// Archivo generado por scripts/inline-migrations.js. No editar a mano.
export default {
  "journal": {
    "version": "7",
    "dialect": "sqlite",
    "entries": [
      {
        "idx": 0,
        "version": "6",
        "when": 1793222460124,
        "tag": "0000_sticky_jackal",
        "breakpoints": true
      }
    ]
  },
  "migrations": {
    "m0000": "CREATE TABLE `moments` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`date` text NOT NULL,\n\t`title` text NOT NULL,\n\t`note` text DEFAULT '' NOT NULL,\n\t`set_number` text,\n\t`theme` text,\n\t`is_favorite` integer DEFAULT false NOT NULL,\n\t`created_at` integer NOT NULL,\n\t`updated_at` integer NOT NULL,\n\t`deleted_at` integer\n);\n--> statement-breakpoint\nCREATE INDEX `moments_date_idx` ON `moments` (`date`);--> statement-breakpoint\nCREATE INDEX `moments_updated_idx` ON `moments` (`updated_at`);--> statement-breakpoint\nCREATE TABLE `photos` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`moment_id` text NOT NULL,\n\t`local_path` text NOT NULL,\n\t`thumb_path` text NOT NULL,\n\t`remote_key` text,\n\t`position` integer DEFAULT 0 NOT NULL,\n\t`width` integer,\n\t`height` integer,\n\t`created_at` integer NOT NULL,\n\t`updated_at` integer NOT NULL,\n\t`deleted_at` integer,\n\tFOREIGN KEY (`moment_id`) REFERENCES `moments`(`id`) ON UPDATE no action ON DELETE cascade\n);\n--> statement-breakpoint\nCREATE INDEX `photos_moment_idx` ON `photos` (`moment_id`);"
  }
};
