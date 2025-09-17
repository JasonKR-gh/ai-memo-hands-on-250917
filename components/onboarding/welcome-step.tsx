// components/onboarding/welcome-step.tsx
// 온보딩 환영 단계 컴포넌트
// 신규 사용자에게 서비스를 소개하는 첫 번째 단계
// 관련 파일: components/onboarding/onboarding-layout.tsx

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
  onSkip: () => void
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            AI 메모장에 오신 것을 환영합니다! 🎉
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            똑똑한 AI가 도와주는 스마트한 메모 관리 서비스입니다
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* 주요 특징 소개 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            이런 기능들을 사용할 수 있어요
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">자동 요약 & 태그</h4>
                  <p className="text-sm text-blue-700">AI가 메모를 분석해서 자동으로 요약하고 태그를 생성해드려요</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔍</span>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">스마트 검색</h4>
                  <p className="text-sm text-green-700">내용을 이해해서 찾아주는 똑똑한 검색 기능</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📱</span>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">음성 메모</h4>
                  <p className="text-sm text-purple-700">말로 메모를 작성하고 자동으로 텍스트로 변환</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
                <div>
                  <h4 className="font-medium text-orange-900">데이터 관리</h4>
                  <p className="text-sm text-orange-700">언제든지 데이터를 내보내고 백업할 수 있어요</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            시작하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            onClick={onSkip}
            variant="outline"
            size="lg"
            className="px-8"
          >
            나중에 하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
