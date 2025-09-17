// app/dashboard/page.tsx
// 대시보드 페이지
// 노트 목록을 보여주는 메인 대시보드 (페이지네이션 지원)
// 관련 파일: app/page.tsx, lib/notes/actions.ts, components/notes/note-list.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getNotesList } from '@/lib/notes/actions'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string
    sort?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    // searchParams를 await
    const params = await searchParams
    
    // 로그인 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/signin')
    }

    // 페이지 번호 파싱 (기본값: 1)
    const currentPage = parseInt(params.page || '1', 10)
    const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage

    // 정렬 옵션 파싱 (기본값: 'newest')
    const sortParam = params.sort
    const validSorts = ['newest', 'oldest', 'title_asc', 'title_desc']
    const sort = (sortParam && validSorts.includes(sortParam)) ? sortParam as 'newest' | 'oldest' | 'title_asc' | 'title_desc' : 'newest'

    // 초기 노트 목록 조회 (페이지네이션 및 정렬 포함)
    const notesResult = await getNotesList(page, 10, sort)

    return (
        <DashboardClient
            user={{
                id: user.id,
                email: user.email
            }}
            initialData={notesResult.success ? notesResult.data : undefined}
            initialPage={page}
        />
    )
}

export const metadata = {
    title: '대시보드 - AI 메모장',
    description: '내 노트를 관리하고 새로운 노트를 작성하세요'
}
