// components/notes/note-list.tsx
// 노트 목록 UI 컴포넌트
// 페이지네이션과 함께 노트 목록을 표시하는 컴포넌트
// 관련 파일: components/notes/note-card.tsx, components/ui/pagination.tsx

'use client'

import { useState } from 'react'
import { NoteCard, NoteCardSkeleton } from './note-card'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { PenTool, Plus } from 'lucide-react' // 향후 사용 예정
// import Link from 'next/link' // 향후 사용 예정
import { Button } from '@/components/ui/button'
import { SortSelector } from './sort-selector'
import { SortOption } from '@/lib/notes/queries'
import { EmptyState } from '@/components/onboarding/empty-state'
import { deleteMultipleNotesAction } from '@/lib/notes/actions'
import { Trash2, CheckSquare, Square } from 'lucide-react'

interface Note {
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface NotesListResult {
  notes: Note[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface NoteListProps {
  data?: NotesListResult
  isLoading?: boolean
  error?: string | null
  className?: string
  currentSort?: SortOption
  onSortChange?: (sort: SortOption) => void
  isNewUser?: boolean
  onDataChange?: () => void // 데이터 변경 시 콜백
}

export function NoteList({ data, isLoading, error, className, currentSort = 'newest', onSortChange, isNewUser = false, onDataChange }: NoteListProps) {
  // 선택 모드 상태
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // 선택 모드 토글
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedNotes(new Set()) // 선택 모드 종료 시 선택 해제
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (!data?.notes) return
    
    if (selectedNotes.size === data.notes.length) {
      // 모두 선택된 상태면 모두 해제
      setSelectedNotes(new Set())
    } else {
      // 일부만 선택되거나 아무것도 선택되지 않은 상태면 모두 선택
      setSelectedNotes(new Set(data.notes.map(note => note.id)))
    }
  }

  // 개별 노트 선택/해제
  const handleNoteSelection = (noteId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedNotes)
    if (isSelected) {
      newSelected.add(noteId)
    } else {
      newSelected.delete(noteId)
    }
    setSelectedNotes(newSelected)
  }

  // 선택된 노트들 삭제
  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) return
    
    setIsDeleting(true)
    try {
      const result = await deleteMultipleNotesAction(Array.from(selectedNotes))
      
      if (result.success) {
        // 성공 시 선택 모드 종료 및 데이터 새로고침
        setIsSelectionMode(false)
        setSelectedNotes(new Set())
        onDataChange?.() // 부모 컴포넌트에 데이터 변경 알림
      } else {
        alert(result.error || '노트 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('노트 삭제 오류:', error)
      alert('노트 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NoteCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20`}>
        <CardHeader>
          <CardTitle className="text-red-300">오류가 발생했습니다</CardTitle>
          <CardDescription className="text-gray-200">
            노트 목록을 불러오는 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 데이터가 없는 경우
  if (!data || data.notes.length === 0) {
    return (
      <EmptyState 
        isNewUser={isNewUser}
        className={className}
      />
    )
  }

  // 노트 목록 표시
  return (
    <div className={className}>
      {/* 상단 컨트롤 바 */}
      <div className="flex items-center justify-between mb-6">
        {/* 선택 모드 컨트롤 */}
        {isSelectionMode ? (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              {selectedNotes.size === data?.notes.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              전체 선택
            </Button>
            
            {selectedNotes.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? '삭제 중...' : `${selectedNotes.size}개 삭제`}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={toggleSelectionMode}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              취소
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={toggleSelectionMode}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <CheckSquare className="w-4 h-4" />
              선택 모드
            </Button>
          </div>
        )}

        {/* 정렬 선택기 */}
        {onSortChange && (
          <SortSelector
            currentSort={currentSort}
            onSortChange={onSortChange}
          />
        )}
      </div>

      {/* 노트 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.notes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            createdAt={note.createdAt}
            updatedAt={note.updatedAt}
            isSelected={selectedNotes.has(note.id)}
            onSelectionChange={handleNoteSelection}
            showCheckbox={isSelectionMode}
          />
        ))}
      </div>

      {/* 페이지네이션 정보 */}
      <PaginationInfo
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        totalCount={data.totalCount}
        className="mb-4"
      />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        hasNextPage={data.hasNextPage}
        hasPreviousPage={data.hasPreviousPage}
      />
    </div>
  )
}
