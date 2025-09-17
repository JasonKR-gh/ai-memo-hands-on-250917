// components/auth/session-initializer.tsx
// 빌드 시 세션 초기화 컴포넌트
// 빌드 타임스탬프를 기반으로 한 번만 초기화 실행
// 관련 파일: app/layout.tsx, lib/supabase/client.ts

'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || Date.now().toString()

export function SessionInitializer() {
    useEffect(() => {
        const initializeSession = async () => {
            // 로컬 스토리지에서 마지막 빌드 타임스탬프 확인
            const lastBuildTimestamp = localStorage.getItem('lastBuildTimestamp')
            
            // 빌드가 새로 되었거나 첫 접속인 경우
            if (!lastBuildTimestamp || lastBuildTimestamp !== BUILD_TIMESTAMP) {
                const supabase = createClient()
                
                // 현재 세션 상태 확인
                const { data: { session } } = await supabase.auth.getSession()
                
                // 세션이 있는 경우에만 로그아웃
                if (session) {
                    await supabase.auth.signOut()
                }
                
                // 현재 빌드 타임스탬프 저장
                localStorage.setItem('lastBuildTimestamp', BUILD_TIMESTAMP)
                
                // 리다이렉트 제거 - 무한 루프 방지
                // window.location.href = '/'
            }
        }
        
        initializeSession()
    }, [])
    
    return null
}
