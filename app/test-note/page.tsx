// app/test-note/page.tsx
// 노트 생성 테스트 페이지
// 디버깅을 위한 간단한 테스트 페이지

'use client'

import { useState } from 'react'
import { testCreateNote } from '@/lib/notes/test-action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestNotePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleTest() {
    try {
      setIsLoading(true)
      setError(null)
      setResult(null)
      
      console.log('테스트 시작...')
      const response = await testCreateNote()
      console.log('테스트 결과:', response)
      setResult('테스트 성공! 콘솔을 확인하세요.')
      
    } catch (err) {
      console.error('테스트 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>노트 생성 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '테스트 중...' : '노트 생성 테스트'}
          </Button>
          
          {result && (
            <div className="p-4 bg-green-100 text-green-800 rounded">
              {result}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded">
              {error}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>1. 버튼을 클릭하세요</p>
            <p>2. 브라우저 개발자 도구 콘솔을 확인하세요</p>
            <p>3. 서버 로그도 확인하세요</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
