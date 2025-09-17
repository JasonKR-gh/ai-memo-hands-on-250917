// app/trash/page.tsx
// 휴지통 페이지 - 삭제된 노트 목록 조회 및 복구/영구삭제 기능
// 사용자가 실수로 삭제한 노트를 복구할 수 있는 페이지
// 관련 파일: lib/notes/actions.ts, components/notes/trash-note-list.tsx

import { getTrashNotesAction } from '@/lib/notes/actions'
import { TrashNoteList } from '@/components/notes/trash-note-list'

interface TrashPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  
  // 휴지통 노트 목록 조회
  const result = await getTrashNotesAction(page, 10)
  
  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">휴지통</h1>
          <p className="text-red-600">휴지통을 불러오는데 실패했습니다: {result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">휴지통</h1>
        <p className="text-gray-600">
          삭제된 노트들이 30일간 보관됩니다. 복구하거나 영구 삭제할 수 있습니다.
        </p>
      </div>

      <TrashNoteList 
        initialData={result.data}
        currentPage={page}
      />
    </div>
  )
}
