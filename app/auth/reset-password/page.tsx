import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = {
  title: '비밀번호 재설정 - AI 메모장',
  description: '새로운 비밀번호를 설정하세요.'
}

export default function ResetPasswordPage() {
        return (
    <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
    )
}
