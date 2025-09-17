// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지
// 개별 노트의 상세 내용을 보여주는 페이지
// 관련 파일: lib/notes/actions.ts, components/notes/note-card.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getNoteDetail } from '@/lib/notes/actions'
import { NoteDetail } from '@/components/notes/note-detail'

interface NoteDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  // params를 await
  const { id } = await params
  
  // 로그인 확인
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/signin')
  }

  // 노트 상세 조회 (권한 검증 포함)
  const result = await getNoteDetail(id)

  if (!result.success) {
    if (result.code === 'NOT_FOUND') {
      notFound()
    } else if (result.code === 'UNAUTHORIZED') {
      redirect('/unauthorized')
    } else {
      // 기타 에러는 404로 처리
      notFound()
    }
  }

  const note = result.data!

  return <NoteDetail note={note} />
}

export const metadata = {
  title: '노트 상세 - AI 메모장',
  description: '노트의 상세 내용을 확인하세요'
}
