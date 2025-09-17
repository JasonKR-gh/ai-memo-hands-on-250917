// app/notes/new/page.tsx
// 노트 작성 페이지
// 새로운 노트를 생성할 수 있는 페이지
// 관련 파일: components/notes/note-form.tsx, lib/notes/actions.ts

import { NoteForm } from '@/components/notes/note-form'

export default function NewNotePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <NoteForm />
    </div>
  )
}
