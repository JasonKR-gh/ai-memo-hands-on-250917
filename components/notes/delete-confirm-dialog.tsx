// components/notes/delete-confirm-dialog.tsx
// 노트 삭제 확인 다이얼로그 컴포넌트 - 사용자가 실수로 노트를 삭제하는 것을 방지
// 삭제 전 확인 절차를 제공하는 모달 다이얼로그
// 관련 파일: components/notes/note-detail.tsx, lib/notes/actions.ts

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteNoteAction } from '@/lib/notes/actions'
import { useRouter } from 'next/navigation'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId: string
  noteTitle: string
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  noteId, 
  noteTitle 
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      const result = await deleteNoteAction(noteId)
      
      if (result.success) {
        onOpenChange(false)
        router.push('/dashboard')
        router.refresh()
      } else {
        alert(`삭제 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>노트 삭제 확인</DialogTitle>
          <DialogDescription>
            정말로 이 노트를 삭제하시겠습니까?
            <br />
            <br />
            <strong>&ldquo;{noteTitle}&rdquo;</strong>
            <br />
            <br />
            삭제된 노트는 30일간 휴지통에 보관되며, 그 이후 자동으로 영구 삭제됩니다.
            휴지통에서 언제든지 복구할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
