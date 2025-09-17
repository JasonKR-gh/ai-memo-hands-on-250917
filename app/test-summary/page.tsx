// app/test-summary/page.tsx
// AI 요약 기능 테스트 페이지
// 요약 생성 기능을 직접 테스트하고 디버깅할 수 있는 페이지
// 관련 파일: lib/ai/actions.ts, components/notes/note-detail.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { generateSummaryTestAction, healthCheckFullAction } from '@/lib/ai/actions'
import { SummaryResponse } from '@/lib/ai/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestSummaryPage() {
  const [testContent, setTestContent] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<SummaryResponse | null>(null)
  const [healthCheck, setHealthCheck] = useState<{
    success?: boolean;
    error?: string;
    checks?: {
      config?: boolean;
      gemini?: boolean;
      database?: boolean;
    };
  } | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const handleTestSummary = async () => {
    if (!testContent.trim()) {
      setError('테스트할 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setSummary('')
    setDebugInfo(null)

    try {
      console.log('[Test Summary] Starting test with content:', testContent.substring(0, 100) + '...')
      
      const result = await generateSummaryTestAction(testContent)

      console.log('[Test Summary] Result:', result)
      setDebugInfo(result)

      if (result.success && result.summary) {
        setSummary(result.summary.content)
      } else {
        setError(result.error || '요약 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('[Test Summary] Error:', err)
      setError(`테스트 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleHealthCheck = async () => {
    setHealthLoading(true)
    setHealthCheck(null)

    try {
      const result = await healthCheckFullAction()
      setHealthCheck(result)
    } catch (err) {
      setHealthCheck({
        success: false,
        error: `헬스체크 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
      })
    } finally {
      setHealthLoading(false)
    }
  }

  const sampleContent = `AI 메모장 프로젝트 개발 일지

오늘은 AI 기반 요약 기능을 구현하는 작업을 진행했습니다. 

주요 작업 내용:
1. Gemini API 연동 설정 완료
2. 요약 생성 서버 액션 구현
3. 데이터베이스 스키마 설계 (summaries 테이블)
4. 프론트엔드 UI 컴포넌트 개발
5. 에러 처리 및 로깅 시스템 구축

기술적 도전 과제:
- 토큰 제한 관리 (8k 토큰)
- 비동기 처리 및 로딩 상태 관리
- 사용자 권한 검증
- API 에러 핸들링

다음 단계:
- 태그 생성 기능 구현
- AI 결과 재생성 기능
- 사용자 피드백 시스템

이 프로젝트를 통해 AI 기술을 활용한 실용적인 애플리케이션 개발 경험을 쌓을 수 있었습니다.`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>대시보드로 돌아가기</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">AI 요약 기능 테스트</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 내용 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="요약할 내용을 입력하세요..."
                className="min-h-[300px]"
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setTestContent(sampleContent)}
                  variant="outline"
                  size="sm"
                >
                  샘플 내용 사용
                </Button>
                <Button 
                  onClick={handleTestSummary}
                  disabled={loading || !testContent.trim()}
                  className="flex items-center space-x-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  <span>요약 생성 테스트</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 결과 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-gray-600">요약을 생성하고 있습니다...</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>에러:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {summary && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700">생성된 요약:</h3>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="whitespace-pre-wrap text-sm">
                      {summary}
                    </div>
                  </div>
                </div>
              )}

              {debugInfo && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-700">디버그 정보:</h3>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!loading && !error && !summary && (
                <div className="text-center py-8 text-gray-500">
                  <p>테스트할 내용을 입력하고 &quot;요약 생성 테스트&quot; 버튼을 클릭하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 시스템 상태 확인 */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>시스템 상태 확인</CardTitle>
              <Button 
                onClick={handleHealthCheck}
                disabled={healthLoading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {healthLoading && <LoadingSpinner size="sm" />}
                <span>헬스체크 실행</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {healthCheck ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${healthCheck.checks?.config ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">설정: {healthCheck.checks?.config ? '정상' : '오류'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${healthCheck.checks?.gemini ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Gemini API: {healthCheck.checks?.gemini ? '정상' : '오류'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${healthCheck.checks?.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">데이터베이스: {healthCheck.checks?.database ? '정상' : '오류'}</span>
                  </div>
                </div>
                
                {healthCheck.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>헬스체크 오류:</strong> {healthCheck.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {healthCheck.success && (
                  <Alert>
                    <AlertDescription>
                      <strong>✅ 모든 서비스가 정상 작동 중입니다!</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>시스템 상태를 확인하려면 &quot;헬스체크 실행&quot; 버튼을 클릭하세요.</span>
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              * 환경 변수는 서버 사이드에서만 접근 가능합니다.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
