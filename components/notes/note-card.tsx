// components/notes/note-card.tsx
// 개별 노트 카드 UI 컴포넌트
// 노트 목록에서 각 노트를 표시하는 카드 컴포넌트
// 관련 파일: components/ui/card.tsx, app/dashboard/page.tsx

'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ExportButton } from './export-button'

interface NoteCardProps {
  id: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
  className?: string
  isSelected?: boolean
  onSelectionChange?: (noteId: string, isSelected: boolean) => void
  showCheckbox?: boolean
}

export function NoteCard({
  id,
  title,
  content,
  createdAt,
  updatedAt,
  className,
  isSelected = false,
  onSelectionChange,
  showCheckbox = false
}: NoteCardProps) {
  // 날짜 포맷팅 함수
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

  // 내용 미리보기 생성 (최대 100자)
  const getContentPreview = (content: string | null) => {
    if (!content) return '내용이 없습니다.'
    
    const cleanContent = content.replace(/\n/g, ' ').trim()
    return cleanContent.length > 100 
      ? `${cleanContent.substring(0, 100)}...`
      : cleanContent
  }

  // 수정일과 작성일이 다른지 확인
  const isUpdated = updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime()

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    onSelectionChange?.(id, e.target.checked)
  }

  // 카드 클릭 핸들러 (선택 모드일 때만)
  const handleCardClick = () => {
    if (showCheckbox && onSelectionChange) {
      onSelectionChange(id, !isSelected)
    }
  }

  return (
    <div className="relative group">
      {/* 체크박스 모드일 때는 선택 상태에 따른 스타일 적용 */}
      <div className={cn(
        showCheckbox && isSelected && 'ring-2 ring-blue-500 bg-blue-50',
        'transition-all duration-200'
      )}>
        {showCheckbox ? (
          // 선택 모드일 때는 Link 없이 Card만 렌더링
          <Card 
            onClick={handleCardClick}
            className={cn(
              'hover:shadow-lg transition-all duration-200 cursor-pointer h-48 flex flex-col',
              'hover:scale-[1.02] hover:border-blue-300 bg-white/10 backdrop-blur-sm border-white/20',
              isSelected && 'border-blue-400 bg-blue-500/20',
              className
            )}
          >
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-300 transition-colors text-white">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-200">
                    {isUpdated ? (
                      <>
                        수정됨 • {formatDate(updatedAt)}
                      </>
                    ) : (
                      formatDate(createdAt)
                    )}
                  </CardDescription>
                </div>
                {/* 체크박스 */}
                <div className="ml-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed flex-1">
                {getContentPreview(content)}
              </p>
            </CardContent>
          </Card>
        ) : (
          // 일반 모드일 때는 Link로 감싸서 상세 페이지로 이동
          <Link href={`/notes/${id}`} className="block">
            <Card className={cn(
              'hover:shadow-lg transition-all duration-200 cursor-pointer h-48 flex flex-col',
              'hover:scale-[1.02] hover:border-blue-300 bg-white/10 backdrop-blur-sm border-white/20',
              className
            )}>
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-300 transition-colors text-white">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-200">
                      {isUpdated ? (
                        <>
                          수정됨 • {formatDate(updatedAt)}
                        </>
                      ) : (
                        formatDate(createdAt)
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed flex-1">
                  {getContentPreview(content)}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
        
        {/* 호버 시 나타나는 액션 버튼들 (체크박스 모드가 아닐 때만) */}
        {!showCheckbox && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              <ExportButton 
                noteId={id}
                noteTitle={title}
                className="h-8 px-2 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface NoteCardSkeletonProps {
  className?: string
}

export function NoteCardSkeleton({ className }: NoteCardSkeletonProps) {
  return (
    <Card className={cn('animate-pulse h-48 flex flex-col bg-white/10 backdrop-blur-sm border-white/20', className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/20 rounded w-full"></div>
          <div className="h-4 bg-white/20 rounded w-5/6"></div>
          <div className="h-4 bg-white/20 rounded w-4/6"></div>
        </div>
      </CardContent>
    </Card>
  )
}
