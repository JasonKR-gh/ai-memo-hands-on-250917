// components/onboarding/progress-indicator.tsx
// 온보딩 진행 상황 표시기 컴포넌트
// 현재 단계와 전체 단계를 시각적으로 표시
// 관련 파일: components/onboarding/onboarding-layout.tsx

'use client'

import { Check } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressIndicator({ currentStep, totalSteps, className }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        
        return (
          <div key={stepNumber} className="flex items-center">
            {/* 단계 원 */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isCurrent 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                stepNumber
              )}
            </div>
            
            {/* 연결선 (마지막 단계가 아닌 경우) */}
            {stepNumber < totalSteps && (
              <div
                className={`
                  w-8 h-0.5 mx-2
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
