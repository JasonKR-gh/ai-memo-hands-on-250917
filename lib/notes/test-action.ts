// lib/notes/test-action.ts
// 노트 생성 테스트용 간단한 액션
// 디버깅을 위한 최소한의 코드

'use server'

import { createClient } from '@/lib/supabase/server'

export async function testCreateNote() {
  try {
    console.log('=== 테스트 노트 생성 시작 ===')
    
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('사용자 인증 결과:', { user: user?.id, authError })
    
    if (authError || !user) {
      throw new Error('인증이 필요합니다.')
    }

    // 간단한 테스트 데이터
    const testData = {
      user_id: user.id,
      title: '테스트 노트',
      content: '테스트 내용입니다.'
    }

    console.log('저장할 데이터:', testData)

    // Supabase를 통해 데이터베이스에 노트 저장
    const { data, error } = await supabase
      .from('notes')
      .insert([testData])
      .select()

    console.log('Supabase 저장 결과:', { data, error })

    if (error) {
      console.error('Supabase 저장 오류:', error)
      throw new Error(`데이터베이스 저장 실패: ${error.message}`)
    }

    console.log('=== 테스트 노트 생성 성공 ===')
    console.log('생성된 노트:', data)
    return { success: true, data }

  } catch (error) {
    console.error('=== 테스트 노트 생성 실패 ===')
    console.error('에러:', error)
    throw error
  }
}
