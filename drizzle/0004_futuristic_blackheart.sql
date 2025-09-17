CREATE TABLE "note_tags" (
	"note_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "note_tags_note_id_tag_pk" PRIMARY KEY("note_id","tag")
);
