CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nickname" text,
	"avatar_url" text,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
