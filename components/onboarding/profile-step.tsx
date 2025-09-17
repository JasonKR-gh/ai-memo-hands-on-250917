// components/onboarding/profile-step.tsx
// 온보딩 프로필 설정 단계 컴포넌트
// 사용자 닉네임과 프로필 이미지를 설정하는 마지막 단계
// 관련 파일: components/onboarding/onboarding-layout.tsx, lib/user-profiles/actions.ts

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Check } from 'lucide-react'
import { updateUserProfileAction } from '@/lib/user-profiles/actions'

interface ProfileStepProps {
  onComplete: () => void
  onPrevious: () => void
  onSkip: () => void
  initialNickname?: string
}

export function ProfileStep({ onComplete, onPrevious, initialNickname = '' }: ProfileStepProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleComplete()
  }

  const handleComplete = async () => {
    console.log('handleComplete 호출됨, nickname:', nickname)
    
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('프로필 업데이트 시작...')
      const result = await updateUserProfileAction({
        nickname: nickname.trim(),
        onboardingCompleted: true
      })

      console.log('프로필 업데이트 결과:', result)

      if (result.success) {
        console.log('프로필 업데이트 성공, 온보딩 완료')
        onComplete()
      } else {
        console.error('프로필 업데이트 실패:', result.error)
        setError(result.error || '프로필 저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('프로필 저장 중 오류:', err)
      setError('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    console.log('handleSkip 호출됨')
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('온보딩 완료 처리 시작...')
      const result = await updateUserProfileAction({
        onboardingCompleted: true
      })

      console.log('온보딩 완료 처리 결과:', result)

      if (result.success) {
        console.log('온보딩 완료 처리 성공')
        onComplete()
      } else {
        console.error('온보딩 완료 처리 실패:', result.error)
        setError(result.error || '온보딩 완료 처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('온보딩 완료 처리 중 오류:', err)
      setError('온보딩 완료 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            프로필 설정
          </CardTitle>
          <CardDescription className="text-lg">
            나만의 닉네임을 설정해보세요 (선택사항)
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
              닉네임
            </Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임을 입력하세요"
              className="text-lg"
              maxLength={20}
            />
            <p className="text-xs text-gray-500">
              다른 사용자에게 표시될 이름입니다. 나중에 변경할 수 있어요.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 프로필 설정 안내 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 프로필 설정 팁
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 닉네임은 나중에 언제든지 변경할 수 있어요</li>
              <li>• 프로필 이미지는 추후 업데이트에서 추가될 예정입니다</li>
              <li>• 설정하지 않아도 서비스를 이용할 수 있어요</li>
            </ul>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              type="button"
              onClick={onPrevious}
              variant="outline"
              size="lg"
              className="px-8"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="button"
                onClick={handleSkip}
                variant="outline"
                size="lg"
                className="px-8"
                disabled={isLoading}
              >
                나중에 하기
              </Button>
              <Button 
                type="button"
                onClick={handleComplete}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  '저장 중...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    완료하기
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
