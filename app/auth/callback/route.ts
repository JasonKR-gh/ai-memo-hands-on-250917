import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isOnboardingCompleted } from '@/lib/user-profiles/queries'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // const next = searchParams.get('next') // 향후 리다이렉트용으로 사용 예정

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // 사용자 정보 가져오기
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                // 온보딩 완료 상태 확인
                const onboardingCompleted = await isOnboardingCompleted(user.id)
                
                if (onboardingCompleted) {
                    // 온보딩이 완료된 경우 대시보드로
                    return NextResponse.redirect(`${origin}/dashboard`)
                } else {
                    // 온보딩이 완료되지 않은 경우 온보딩으로
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }
        }
    }

    // 인증 실패 시 에러 페이지로 리다이렉트
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
