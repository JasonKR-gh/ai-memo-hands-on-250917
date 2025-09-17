// components/onboarding/features-step.tsx
// 온보딩 기능 소개 단계 컴포넌트
// AI 메모장의 핵심 기능들을 상세히 소개하는 두 번째 단계
// 관련 파일: components/onboarding/onboarding-layout.tsx

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Mic, 
  Search, 
  Download, 
  Tag, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react'

interface FeaturesStepProps {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
}

export function FeaturesStep({ onNext, onPrevious, onSkip }: FeaturesStepProps) {
  const features = [
    {
      icon: FileText,
      title: '텍스트 메모 작성',
      description: '키보드로 빠르고 편리하게 메모를 작성하세요',
      color: 'blue',
      details: [
        '실시간 자동 저장',
        '마크다운 문법 지원',
        '제목과 본문 구분'
      ]
    },
    {
      icon: Mic,
      title: '음성 메모 변환',
      description: '말로 메모를 작성하고 자동으로 텍스트로 변환',
      color: 'green',
      details: [
        '음성을 텍스트로 변환',
        '실시간 변환 지원',
        '언어 감지 자동화'
      ]
    },
    {
      icon: Sparkles,
      title: 'AI 자동 요약',
      description: 'AI가 메모 내용을 분석해서 핵심만 요약해드려요',
      color: 'purple',
      details: [
        '핵심 내용 자동 추출',
        '키워드 하이라이트',
        '요약 길이 조절 가능'
      ]
    },
    {
      icon: Tag,
      title: '스마트 태그 생성',
      description: '메모 내용을 분석해서 관련 태그를 자동 생성',
      color: 'orange',
      details: [
        '주제별 태그 자동 생성',
        '색상으로 구분',
        '태그별 필터링 가능'
      ]
    },
    {
      icon: Search,
      title: '지능형 검색',
      description: '내용을 이해해서 찾아주는 똑똑한 검색',
      color: 'indigo',
      details: [
        '의미 기반 검색',
        '태그와 내용 통합 검색',
        '검색 결과 하이라이트'
      ]
    },
    {
      icon: Download,
      title: '데이터 내보내기',
      description: '언제든지 메모를 백업하고 다른 곳으로 가져가세요',
      color: 'gray',
      details: [
        'PDF, Markdown 형식 지원',
        '일괄 다운로드',
        '개별 메모 내보내기'
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          AI 메모장의 핵심 기능들
        </CardTitle>
        <CardDescription className="text-lg">
          이제 각 기능이 어떻게 작동하는지 자세히 알아보세요
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = getColorClasses(feature.color)
            
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${colorClasses} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm mb-3 opacity-80">
                      {feature.description}
                    </p>
                    <ul className="space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-xs flex items-center">
                          <span className="w-1 h-1 rounded-full bg-current mr-2"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button 
            onClick={onPrevious}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="px-8"
            >
              나중에 하기
            </Button>
            <Button 
              onClick={onNext}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            >
              다음
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
