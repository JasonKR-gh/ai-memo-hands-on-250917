// app/test-export/page.tsx
// 노트 export 기능 테스트 페이지
// export 기능이 정상적으로 작동하는지 확인
// 관련 파일: lib/notes/actions.ts, components/notes/export-button.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExportButton } from '@/components/notes/export-button'
import { getNotesList } from '@/lib/notes/actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestExportPage() {
  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const result = await getNotesList(1, 10, 'newest')
      
      if (result.success && result.data) {
        setNotes(result.data.notes)
      } else {
        setError(result.error || '노트를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError('노트를 불러오는데 실패했습니다.')
      console.error('노트 로딩 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '날짜 없음'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">노트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Export 기능 테스트</h1>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 노트 목록 */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">테스트할 노트가 없습니다.</p>
              <Link href="/notes/new">
                <Button className="mt-4">새 노트 만들기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              노트 목록 ({notes.length}개)
            </h2>
            
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <ExportButton 
                      noteId={note.id}
                      noteTitle={note.title}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(note.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 line-clamp-3">
                    {note.content || '(내용 없음)'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 사용법 안내 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Export 기능 사용법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700">
              <p><strong>1. 노트 카드에서 Export 버튼 클릭</strong></p>
              <p>• 각 노트 카드의 우측 상단에 있는 Export 버튼을 클릭하세요.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>2. 자동 다운로드</strong></p>
              <p>• 노트가 .txt 파일로 자동 다운로드됩니다.</p>
              <p>• 파일명: [노트제목]_[날짜].txt</p>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>3. 파일 내용</strong></p>
              <p>• 노트 제목, 생성일, 수정일, 노트 ID</p>
              <p>• 노트 본문 내용</p>
              <p>• Export 정보 (언제 export되었는지)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
