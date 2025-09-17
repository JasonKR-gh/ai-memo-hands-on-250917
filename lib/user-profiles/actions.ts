// lib/user-profiles/actions.ts
// 사용자 프로필 관련 Server Actions
// 온보딩 상태와 프로필 정보를 관리하는 서버 액션
// 관련 파일: lib/user-profiles/queries.ts, lib/supabase/server.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile, 
  isOnboardingCompleted 
} from './queries'

/**
 * 사용자 프로필 조회 Server Action
 */
export async function getUserProfileAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      // 프로필이 없으면 기본 프로필 생성
      const newProfile = await createUserProfile({
        id: user.id,
        nickname: user.email?.split('@')[0] || '사용자',
        onboardingCompleted: false
      })
      
      return { success: true, data: newProfile }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('프로필 조회 실패:', error)
    return { success: false, error: '프로필을 불러오는데 실패했습니다.' }
  }
}

/**
 * 사용자 프로필 업데이트 Server Action
 */
export async function updateUserProfileAction(data: {
  nickname?: string
  avatarUrl?: string
  onboardingCompleted?: boolean
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    // 먼저 기존 프로필이 있는지 확인
    let profile = await getUserProfile(user.id)
    
    if (!profile) {
      // 프로필이 없으면 새로 생성
      console.log('프로필이 없어서 새로 생성합니다.')
      profile = await createUserProfile({
        id: user.id,
        nickname: user.email?.split('@')[0] || '사용자',
        onboardingCompleted: false
      })
    }

    if (!profile) {
      console.error('프로필 생성 실패')
      return { success: false, error: '프로필 생성에 실패했습니다.' }
    }

    console.log('기존 프로필:', profile)

    // 프로필 업데이트
    console.log('프로필 업데이트 시작:', data)
    const updatedProfile = await updateUserProfile(user.id, data)
    
    if (!updatedProfile) {
      console.error('프로필 업데이트 실패')
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }

    console.log('프로필 업데이트 성공:', updatedProfile)
    return { success: true, data: updatedProfile }
  } catch (error) {
    console.error('프로필 업데이트 실패:', error)
    return { success: false, error: '프로필 업데이트에 실패했습니다.' }
  }
}

/**
 * 온보딩 완료 처리 Server Action
 */
export async function completeOnboardingAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    const profile = await updateUserProfile(user.id, {
      onboardingCompleted: true
    })
    
    if (!profile) {
      return { success: false, error: '온보딩 완료 처리에 실패했습니다.' }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('온보딩 완료 처리 실패:', error)
    return { success: false, error: '온보딩 완료 처리에 실패했습니다.' }
  }
}

/**
 * 온보딩 상태 확인 Server Action
 */
export async function checkOnboardingStatusAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }

    const completed = await isOnboardingCompleted(user.id)
    return { success: true, data: { completed } }
  } catch (error) {
    console.error('온보딩 상태 확인 실패:', error)
    return { success: false, error: '온보딩 상태를 확인할 수 없습니다.' }
  }
}
