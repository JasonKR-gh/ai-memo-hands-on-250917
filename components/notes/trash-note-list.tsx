// components/notes/trash-note-list.tsx
// 휴지통 노트 목록 컴포넌트 - 삭제된 노트들을 표시하고 복구/영구삭제 기능 제공
// 사용자가 삭제된 노트를 관리할 수 있는 인터페이스
// 관련 파일: app/trash/page.tsx, lib/notes/actions.ts

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { restoreNoteAction, permanentDeleteNoteAction } from '@/lib/notes/actions'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ExportButton } from './export-button'

interface TrashNote {
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
  deletedAt: Date | null
  deletedBy: string | null
}

interface TrashNoteListProps {
  initialData: {
    notes: TrashNote[]
    totalCount: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  currentPage: number
}

export function TrashNoteList({ initialData, currentPage }: TrashNoteListProps) {
  const [notes, setNotes] = useState(initialData.notes)
  const [loading, setLoading] = useState<{ [key: string]: 'restore' | 'delete' | null }>({})
  const router = useRouter()

  const handleRestore = async (noteId: string) => {
    setLoading(prev => ({ ...prev, [noteId]: 'restore' }))
    
    try {
      const result = await restoreNoteAction(noteId)
      
      if (result.success) {
        // 복구된 노트를 목록에서 제거
        setNotes(prev => prev.filter(note => note.id !== noteId))
        router.refresh()
      } else {
        alert(`복구 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('복구 오류:', error)
      alert('복구 중 오류가 발생했습니다.')
    } finally {
      setLoading(prev => ({ ...prev, [noteId]: null }))
    }
  }

  const handlePermanentDelete = async (noteId: string) => {
    if (!confirm('정말로 이 노트를 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setLoading(prev => ({ ...prev, [noteId]: 'delete' }))
    
    try {
      const result = await permanentDeleteNoteAction(noteId)
      
      if (result.success) {
        // 영구 삭제된 노트를 목록에서 제거
        setNotes(prev => prev.filter(note => note.id !== noteId))
        router.refresh()
      } else {
        alert(`영구 삭제 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('영구 삭제 오류:', error)
      alert('영구 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(prev => ({ ...prev, [noteId]: null }))
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '알 수 없음'
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ko 
    })
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">휴지통이 비어있습니다</h3>
        <p className="text-gray-500">삭제된 노트가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          총 {initialData.totalCount}개의 삭제된 노트
        </p>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <Badge variant="destructive" className="ml-2">
                  삭제됨
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {note.content && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {note.content}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <div>
                  <span>삭제일: {formatDate(note.deletedAt)}</span>
                </div>
                <div>
                  <span>생성일: {formatDate(note.createdAt)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <ExportButton 
                  noteId={note.id}
                  noteTitle={note.title}
                  className="h-8 px-2 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(note.id)}
                  disabled={loading[note.id] === 'restore'}
                >
                  {loading[note.id] === 'restore' ? '복구 중...' : '복구'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(note.id)}
                  disabled={loading[note.id] === 'delete'}
                >
                  {loading[note.id] === 'delete' ? '삭제 중...' : '영구 삭제'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 */}
      {initialData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={!initialData.hasPreviousPage}
            onClick={() => router.push(`/trash?page=${currentPage - 1}`)}
          >
            이전
          </Button>
          
          <span className="text-sm text-gray-600">
            {currentPage} / {initialData.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={!initialData.hasNextPage}
            onClick={() => router.push(`/trash?page=${currentPage + 1}`)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
