// lib/user-profiles/queries.ts
// 사용자 프로필 관련 데이터베이스 쿼리 함수들
// 온보딩 상태와 프로필 정보를 관리하는 쿼리
// 관련 파일: lib/db/schema/user-profiles.ts, lib/user-profiles/actions.ts

import { db } from '@/lib/db/connection'
import { userProfiles } from '@/lib/db/schema/user-profiles'
import { eq } from 'drizzle-orm'

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string) {
  try {
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1)

    return profile[0] || null
  } catch (error) {
    console.error('사용자 프로필 조회 실패:', error)
    return null
  }
}

/**
 * 사용자 프로필 생성
 */
export async function createUserProfile(data: {
  id: string
  nickname?: string
  avatarUrl?: string
  onboardingCompleted?: boolean
}) {
  try {
    const [profile] = await db
      .insert(userProfiles)
      .values({
        id: data.id,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        onboardingCompleted: data.onboardingCompleted || false
      })
      .returning()

    return profile
  } catch (error) {
    console.error('사용자 프로필 생성 실패:', error)
    return null
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string,
  data: {
    nickname?: string
    avatarUrl?: string
    onboardingCompleted?: boolean
  }
) {
  try {
    const [profile] = await db
      .update(userProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.id, userId))
      .returning()

    return profile
  } catch (error) {
    console.error('사용자 프로필 업데이트 실패:', error)
    return null
  }
}

/**
 * 온보딩 완료 상태 확인
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId)
    return profile?.onboardingCompleted || false
  } catch (error) {
    console.error('온보딩 상태 확인 실패:', error)
    return false
  }
}
