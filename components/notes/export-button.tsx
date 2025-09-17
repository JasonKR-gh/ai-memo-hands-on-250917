// components/notes/export-button.tsx
// 노트 export 버튼 컴포넌트
// 특정 노트를 .txt 파일로 다운로드하는 기능
// 관련 파일: lib/notes/actions.ts, components/notes/note-detail.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { exportNoteAsTxt } from '@/lib/notes/actions'
import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  noteId: string
  noteTitle: string
  className?: string
}

export function ExportButton({ noteId, noteTitle, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // 서버에서 노트 데이터 가져오기
      const result = await exportNoteAsTxt(noteId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Export에 실패했습니다.')
      }

      // Blob 생성 및 다운로드
      const blob = new Blob([result.data.content], { 
        type: result.data.mimeType 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.data.fileName
      
      // DOM에 추가하고 클릭 후 제거
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // URL 해제
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export 오류:', error)
      alert(error instanceof Error ? error.message : 'Export에 실패했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className={className}
      title={`"${noteTitle}" 노트를 .txt 파일로 다운로드`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isExporting ? 'Export 중...' : 'Export'}
      </span>
    </Button>
  )
}
