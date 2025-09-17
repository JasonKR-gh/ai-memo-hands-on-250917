// components/notes/note-form.tsx
// 노트 작성 폼 컴포넌트
// 제목과 본문을 입력받아 노트를 생성하는 폼
// 관련 파일: app/notes/new/page.tsx, lib/notes/actions.ts, components/ui/*

'use client'

import { useState } from 'react'
import { createNote } from '@/lib/notes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NoteForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    try {
      setIsLoading(true)
      setError(null)
      const result = await createNote(formData)
      
      if (result?.success) {
        // 성공 시 대시보드로 리다이렉트
        window.location.href = '/dashboard'
      } else {
        setError('노트 저장에 실패했습니다.')
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>새 노트 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              placeholder="노트 제목을 입력하세요"
              autoFocus
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">본문</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="노트 내용을 입력하세요"
              rows={10}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">저장 실패:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
