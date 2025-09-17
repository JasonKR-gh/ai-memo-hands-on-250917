// components/onboarding/onboarding-layout.tsx
// 온보딩 공통 레이아웃 컴포넌트
// 모든 온보딩 단계에서 공통으로 사용되는 레이아웃
// 관련 파일: components/onboarding/onboarding-flow.tsx

'use client'

import { ProgressIndicator } from './progress-indicator'

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
}

export function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI 메모장</h1>
            </div>
            <div className="text-sm text-gray-500">
              단계 {currentStep} / {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* 진행 상황 표시기 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps}
          />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>

      {/* 푸터 */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>AI 메모장과 함께 똑똑한 메모 관리를 시작해보세요</p>
          </div>
        </div>
      </div>
    </div>
  )
}
