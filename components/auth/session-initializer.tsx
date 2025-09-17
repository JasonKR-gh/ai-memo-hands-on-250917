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
            const supabase = createClient()
            
            // 세션 상태 확인 및 새로고침
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
                console.error('세션 확인 중 오류:', error)
                return
            }
            
            // 세션이 있으면 유지하고, 없으면 그대로 둠
            if (session) {
                console.log('세션 확인됨:', session.user.email)
            } else {
                console.log('세션이 없음 - 로그인 필요')
            }
        }
        
        initializeSession()
    }, [])
    
    return null
}
