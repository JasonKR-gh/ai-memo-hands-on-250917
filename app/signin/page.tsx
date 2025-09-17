import { SignInForm } from '@/components/auth/signin-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

async function StatusMessage({
    searchParams
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const params = await searchParams
    
    if (params.message === 'password-updated') {
        return (
            <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                ✅ 비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로
                로그인해주세요.
            </div>
        )
    }
    
    if (params.error) {
        let errorMessage = '로그인 중 오류가 발생했습니다.'
        
        switch (params.error) {
            case 'auth-failed':
                errorMessage = '인증에 실패했습니다. 다시 로그인해주세요.'
                break
            case 'not-authenticated':
                errorMessage = '로그인이 필요합니다.'
                break
            case 'server-error':
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                break
        }
        
        return (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                ⚠️ {errorMessage}
            </div>
        )
    }
    
    return null
}

export default async function SignInPage({
    searchParams
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (user) {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        AI 메모장
                    </h1>
                    <p className="text-gray-600">다시 만나서 반갑습니다</p>
                </div>
                <Suspense fallback={null}>
                    <StatusMessage searchParams={searchParams} />
                </Suspense>
                <SignInForm />
            </div>
        </div>
    )
}

export const metadata = {
    title: '로그인 - AI 메모장',
    description: 'AI 메모장에 로그인하세요'
}
