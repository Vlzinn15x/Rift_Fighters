CREATE TABLE IF NOT EXISTS `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`guest` text,
	`host_name` text NOT NULL,
	`guest_name` text,
	`host_char` integer DEFAULT 0 NOT NULL,
	`guest_char` integer DEFAULT 0 NOT NULL,
	`host_ready` integer DEFAULT 0 NOT NULL,
	`guest_ready` integer DEFAULT 0 NOT NULL,
	`started` integer DEFAULT 0 NOT NULL,
	`map` integer DEFAULT 0 NOT NULL,
	`snapshot` text,
	`input` text,
	`updated` integer NOT NULL
);
