// lib/db/schema/note-tags.ts
// 노트 태그 데이터 모델 스키마 정의
// Drizzle ORM을 사용한 PostgreSQL 테이블 정의
// 관련 파일: lib/db/connection.ts, lib/notes/queries.ts

import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const noteTags = pgTable('note_tags', {
  noteId: uuid('note_id').notNull(),
  tag: text('tag').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.tag] })
}))

// Zod 스키마 자동 생성
export const insertNoteTagSchema = createInsertSchema(noteTags)
export const selectNoteTagSchema = createSelectSchema(noteTags)

export type NoteTag = typeof noteTags.$inferSelect
export type NewNoteTag = typeof noteTags.$inferInsert
