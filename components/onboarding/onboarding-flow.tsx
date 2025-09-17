// components/onboarding/onboarding-flow.tsx
// 온보딩 플로우 메인 컴포넌트
// 3단계 온보딩 과정을 관리하는 컨테이너 컴포넌트
// 관련 파일: components/onboarding/onboarding-layout.tsx, lib/user-profiles/actions.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingLayout } from './onboarding-layout'
import { WelcomeStep } from './welcome-step'
import { FeaturesStep } from './features-step'
import { ProfileStep } from './profile-step'
import { getUserProfileAction } from '@/lib/user-profiles/actions'

const TOTAL_STEPS = 3

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [userProfile, setUserProfile] = useState<{
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    onboardingCompleted: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 사용자 프로필 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const result = await getUserProfileAction()
        if (result.success && result.data) {
          setUserProfile(result.data)
        }
      } catch (error) {
        console.error('사용자 프로필 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  // 단계 이동 핸들러들
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    // 온보딩을 건너뛰고 대시보드로 이동
    router.push('/dashboard')
  }

  const handleComplete = () => {
    // 온보딩 완료 후 대시보드로 이동
    router.push('/dashboard')
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={TOTAL_STEPS}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  // 현재 단계에 따른 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            onNext={handleNext}
            onSkip={handleSkip}
          />
        )
      case 2:
        return (
          <FeaturesStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
          />
        )
      case 3:
        return (
          <ProfileStep
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            initialNickname={userProfile?.nickname || ''}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={TOTAL_STEPS}>
      {renderCurrentStep()}
    </OnboardingLayout>
  )
}
