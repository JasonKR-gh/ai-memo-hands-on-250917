// components/dashboard/dashboard-client.tsx
// 대시보드 클라이언트 컴포넌트
// 정렬 기능과 페이지네이션을 포함한 대시보드 UI
// 관련 파일: app/dashboard/page.tsx, components/notes/note-list.tsx, lib/notes/actions.ts

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoutDialog } from '@/components/auth/logout-dialog'
import { NoteList } from '@/components/notes/note-list'
import { getNotesList } from '@/lib/notes/actions'
import { getUserProfileAction } from '@/lib/user-profiles/actions'
import { Plus, Trash2, Home } from 'lucide-react'
import { SortOption } from '@/lib/notes/queries'

interface DashboardClientProps {
  user: {
    id: string
    email: string | undefined
  }
  initialData?: {
    notes: Array<{
      id: string
      userId: string
      title: string
      content: string | null
      createdAt: Date | null
      updatedAt: Date | null
    }>
    totalCount: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  initialPage?: number
}

export function DashboardClient({ user, initialData, initialPage = 1 }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const [isPending, startTransition] = useTransition() // 향후 페이지네이션에서 사용 예정
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sortFromUrl = searchParams.get('sort') as SortOption
    return sortFromUrl && ['newest', 'oldest', 'title_asc', 'title_desc'].includes(sortFromUrl) 
      ? sortFromUrl 
      : 'newest'
  })
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  
  // 이전 URL 파라미터를 추적하기 위한 ref
  const prevParamsRef = useRef<string>('')

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (newSort: SortOption) => {
    // URL 업데이트 (정렬 옵션을 URL에 추가)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page') // 첫 페이지로 이동
    params.set('sort', newSort)
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  // 페이지 변경 핸들러 (향후 페이지네이션에서 사용 예정)
  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page)
  //   loadNotes(page, sortBy)
  // }

  // 노트 목록 로드 함수
  const loadNotes = useCallback(async (page: number, sort: SortOption) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getNotesList(page, 10, sort)
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || '노트 목록을 불러오는데 실패했습니다.')
      }
    } catch {
      setError('노트 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // URL 파라미터 변경 감지
  useEffect(() => {
    const currentParams = searchParams.toString()
    
    // URL이 실제로 변경되었을 때만 처리
    if (currentParams !== prevParamsRef.current) {
      prevParamsRef.current = currentParams
      
      const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
      const sortFromUrl = searchParams.get('sort') as SortOption
      const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl
      const validSort = sortFromUrl && ['newest', 'oldest', 'title_asc', 'title_desc'].includes(sortFromUrl) 
        ? sortFromUrl 
        : 'newest'
      
      setCurrentPage(validPage)
      setSortBy(validSort)
      loadNotes(validPage, validSort)
    }
  }, [searchParams, loadNotes])

  // 사용자 프로필 로드 및 신규 사용자 확인
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const result = await getUserProfileAction()
        if (result.success && result.data) {
          // 온보딩이 완료되지 않은 사용자는 신규 사용자로 간주
          setIsNewUser(!result.data.onboardingCompleted)
        }
      } catch (error) {
        console.error('사용자 프로필 로드 실패:', error)
      }
    }

    loadUserProfile()
  }, [])

  // 초기 데이터가 없으면 로드
  useEffect(() => {
    if (!initialData) {
      loadNotes(currentPage, sortBy)
    }
  }, [initialData, currentPage, sortBy, loadNotes])

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1663427929917-333d88949f7a?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 콘텐츠 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                내 노트
              </h1>
              <p className="text-gray-100 mt-1 drop-shadow-md">
                안녕하세요, {user.email || '사용자'}님! 👋
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className="text-gray-600 hover:text-gray-700">
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <Link href="/notes/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  새 노트 작성
                </Button>
              </Link>
              <Link href="/trash">
                <Button variant="outline" className="text-gray-600 hover:text-gray-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  휴지통
                </Button>
              </Link>
              <LogoutDialog />
            </div>
          </div>
        </div>

        {/* 노트 목록 */}
        <NoteList
          data={data}
          isLoading={isLoading}
          error={error}
          currentSort={sortBy}
          onSortChange={handleSortChange}
          isNewUser={isNewUser}
          onDataChange={() => loadNotes(currentPage, sortBy)}
        />
      </div>
    </div>
  )
}
