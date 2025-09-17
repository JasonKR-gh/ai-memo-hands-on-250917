// lib/db/schema/summaries.ts
// 요약 데이터 모델 스키마 정의
// Drizzle ORM을 사용한 PostgreSQL 테이블 정의
// 관련 파일: lib/db/connection.ts, lib/ai/actions.ts

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const summaries = pgTable('summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id').notNull(),
  model: text('model').notNull().default('gemini-1.5-flash'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
})

// Zod 스키마 자동 생성
export const insertSummarySchema = createInsertSchema(summaries)
export const selectSummarySchema = createSelectSchema(summaries)

export type Summary = typeof summaries.$inferSelect
export type NewSummary = typeof summaries.$inferInsert
