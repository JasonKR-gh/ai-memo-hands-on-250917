// app/test-auto-ai/page.tsx
// AI 자동 생성 기능 테스트 페이지
// 노트 생성 시 AI 요약과 태그가 자동으로 생성되는지 테스트
// 관련 파일: lib/notes/actions.ts, lib/ai/actions.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createNote } from '@/lib/notes/actions'
import { ArrowLeft, Plus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function TestAutoAIPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    noteId?: string;
    error?: string;
  } | null>(null)
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null)

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      setResult({
        success: false,
        error: '제목과 내용을 모두 입력해주세요.'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)

      const response = await createNote(formData)
      
      if (response.success) {
        setResult({
          success: true,
          noteId: response.data.id
        })
        setCreatedNoteId(response.data.id)
      } else {
        setResult({
          success: false,
          error: '노트 생성에 실패했습니다.'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const sampleContent = `AI 메모장 프로젝트 개발 일지

오늘은 AI 기반 요약 및 태그 자동 생성 기능을 구현하는 작업을 진행했습니다.

주요 작업 내용:
1. 노트 생성/수정 시 AI 요약과 태그 자동 생성 로직 구현
2. 백그라운드에서 비동기적으로 AI 처리 실행
3. 사용자 경험 개선을 위한 로딩 상태 관리
4. 에러 처리 및 로깅 시스템 구축

기술적 도전 과제:
- Promise.all을 사용한 병렬 AI 처리
- 사용자 대기 시간 최소화
- AI 처리 실패 시 적절한 에러 핸들링
- 데이터베이스 트랜잭션 관리

다음 단계:
- AI 처리 상태 실시간 업데이트
- 사용자 피드백 시스템
- AI 결과 품질 개선

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
            <h1 className="text-2xl font-bold">AI 자동 생성 기능 테스트</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>노트 생성 테스트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="노트 제목을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">내용</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="노트 내용을 입력하세요..."
                  className="min-h-[300px]"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setTitle('AI 자동 생성 테스트')
                    setContent(sampleContent)
                  }}
                  variant="outline"
                  size="sm"
                >
                  샘플 데이터 사용
                </Button>
                <Button 
                  onClick={handleCreateNote}
                  disabled={loading || !title.trim() || !content.trim()}
                  className="flex items-center space-x-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  <Plus className="w-4 h-4" />
                  <span>노트 생성</span>
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
                  <span className="ml-2 text-gray-600">노트를 생성하고 있습니다...</span>
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.success ? '노트 생성 성공!' : '노트 생성 실패'}
                    </span>
                  </div>
                  
                  {result.success && result.noteId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>노트 ID:</strong> {result.noteId}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        AI 요약과 태그가 백그라운드에서 자동으로 생성되고 있습니다.
                      </p>
                    </div>
                  )}
                  
                  {result.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <strong>에러:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {createdNoteId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">다음 단계:</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    생성된 노트를 확인하여 AI 요약과 태그가 자동으로 생성되었는지 확인해보세요.
                  </p>
                  <Link href={`/notes/${createdNoteId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      생성된 노트 보기
                    </Button>
                  </Link>
                </div>
              )}

              {!loading && !result && (
                <div className="text-center py-8 text-gray-500">
                  <p>제목과 내용을 입력하고 &quot;노트 생성&quot; 버튼을 클릭하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 설명 섹션 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>테스트 설명</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700">
              <p><strong>이 테스트의 목적:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>노트 생성 시 AI 요약과 태그가 자동으로 생성되는지 확인</li>
                <li>백그라운드에서 비동기적으로 AI 처리가 실행되는지 확인</li>
                <li>사용자 경험이 개선되었는지 확인</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-700">
              <p><strong>예상 결과:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>노트 생성 후 즉시 노트 상세 페이지로 이동 가능</li>
                <li>노트 상세 페이지에서 AI 요약과 태그가 자동으로 로드됨</li>
                <li>AI 처리 중에는 로딩 상태가 표시됨</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
