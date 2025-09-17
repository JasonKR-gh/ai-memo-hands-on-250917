// app/notes/[id]/loading.tsx
// 노트 상세 페이지 로딩 상태
// 노트 데이터를 불러오는 동안 표시되는 로딩 UI
// 관련 파일: app/notes/[id]/page.tsx, components/ui/loading-spinner.tsx

import { LoadingSpinnerWithText } from '@/components/ui/loading-spinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinnerWithText 
        text="노트를 불러오는 중..." 
        size="lg"
        className="py-16"
      />
    </div>
  )
}
