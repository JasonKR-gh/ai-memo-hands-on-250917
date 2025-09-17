// components/ui/back-button.tsx
// 뒤로가기 버튼 컴포넌트
// 브라우저 히스토리를 사용하여 이전 페이지로 이동
// 관련 파일: app/not-found.tsx

'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  className?: string
}

export function BackButton({ className }: BackButtonProps) {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.history.back()}
      className={className}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>이전 페이지</span>
    </Button>
  )
}
