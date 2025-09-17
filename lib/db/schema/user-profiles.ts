// lib/db/schema/user-profiles.ts
// 사용자 프로필 데이터 모델 스키마 정의
// 온보딩 상태와 사용자 정보를 관리하는 테이블
// 관련 파일: lib/db/connection.ts, lib/auth/actions.ts

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  nickname: text('nickname'),
  avatarUrl: text('avatar_url'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

// Zod 스키마 자동 생성
export const insertUserProfileSchema = createInsertSchema(userProfiles)
export const selectUserProfileSchema = createSelectSchema(userProfiles)

export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
