// components/ui/pagination.tsx
// 페이지네이션 UI 컴포넌트
// 노트 목록의 페이지 네비게이션을 위한 컴포넌트
// 관련 파일: components/ui/button.tsx, app/dashboard/page.tsx

'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  className?: string
}

function PaginationContent({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  className
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : ''
    router.push(`/dashboard${newUrl}`)
  }

  // 페이지 번호 배열 생성 (최대 5개 페이지 번호 표시)
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 5개 이하인 경우
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 현재 페이지를 중심으로 페이지 번호 생성
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)
      
      // 시작 페이지가 1에 가까우면 끝 페이지를 조정
      if (startPage <= 2) {
        endPage = Math.min(totalPages, 5)
        startPage = 1
      }
      
      // 끝 페이지가 마지막에 가까우면 시작 페이지를 조정
      if (endPage >= totalPages - 1) {
        startPage = Math.max(1, totalPages - 4)
        endPage = totalPages
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="flex items-center space-x-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>이전</span>
      </Button>

      {/* 페이지 번호들 */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={cn(
              'w-10 h-10',
              page === currentPage 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
            )}
          >
            {page}
          </Button>
        ))}
      </div>

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="flex items-center space-x-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-50"
      >
        <span>다음</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div className="flex justify-center">로딩 중...</div>}>
      <PaginationContent {...props} />
    </Suspense>
  )
}

interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalCount: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalCount,
  className
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * 10 + 1
  const endItem = Math.min(currentPage * 10, totalCount)

  return (
    <div className={cn('text-sm text-gray-200 text-center', className)}>
      {totalCount > 0 ? (
        <>
          {startItem}-{endItem} / 총 {totalCount}개 노트
          <span className="mx-2">•</span>
          {currentPage} / {totalPages} 페이지
        </>
      ) : (
        '노트가 없습니다'
      )}
    </div>
  )
}
