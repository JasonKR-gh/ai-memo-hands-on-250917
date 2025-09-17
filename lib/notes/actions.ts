// lib/notes/actions.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 사이드 로직
// 관련 파일: lib/db/schema/notes.ts, lib/db/connection.ts, app/notes/new/page.tsx

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getNotesByUserId, getNoteById, updateNote, softDeleteNote, restoreNote, permanentDeleteNote, getTrashNotes, SortOption } from './queries'
import { generateSummaryAction, generateTagsAction } from '@/lib/ai/actions'

export async function createNote(formData: FormData) {
  try {
    console.log('=== 노트 생성 시작 ===')
    
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('사용자 인증 결과:', { user: user?.id, authError })
    
    if (authError || !user) {
      throw new Error('인증이 필요합니다.')
    }

    // 폼 데이터 추출
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    console.log('폼 데이터:', { title, content })

    // 노트 데이터 준비
    const noteData = {
      user_id: user.id,
      title: title?.trim() || '제목 없음',
      content: content?.trim() || null
    }

    console.log('저장할 데이터:', noteData)

    // Supabase를 통해 데이터베이스에 노트 저장
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()

    console.log('Supabase 저장 결과:', { data, error })

    if (error) {
      console.error('Supabase 저장 오류:', error)
      throw new Error(`데이터베이스 저장 실패: ${error.message}`)
    }

    // AI 요약과 태그 자동 생성 (비동기로 처리하여 사용자 경험 개선)
    const noteId = data[0].id
    const noteContent = data[0].content
    
    if (noteContent && noteContent.trim().length > 0) {
      // AI 처리를 백그라운드에서 실행 (사용자 대기 없이)
      Promise.all([
        generateSummaryAction(noteId, noteContent, user.id),
        generateTagsAction(noteId, noteContent, user.id)
      ]).catch(error => {
        console.error('AI 처리 중 오류 발생:', error)
        // AI 처리 실패는 사용자에게 알리지 않고 로그만 남김
      })
    }
    
    // 캐시 무효화
    revalidatePath('/dashboard')
    
    console.log('=== 노트 생성 성공 ===')
    
    // 성공 상태 반환
    return {
      success: true,
      data: data[0]
    }
    
  } catch (error) {
    // Next.js redirect는 에러가 아니므로 무시
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error // redirect 에러는 다시 던지기
    }
    
    console.error('노트 생성 오류:', error)
    
    // 더 자세한 에러 정보 로깅
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message)
      console.error('에러 스택:', error.stack)
    }
    
    // Zod 검증 오류인 경우
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error('Zod 검증 오류:', error)
      throw new Error('입력 데이터가 올바르지 않습니다.')
    }
    
    throw new Error('노트 생성에 실패했습니다. 다시 시도해주세요.')
  }
}

/**
 * 사용자의 노트 목록을 페이지네이션과 함께 조회
 * @param page 현재 페이지 (1부터 시작)
 * @param limit 페이지당 노트 수 (기본값: 10)
 * @param sortBy 정렬 옵션 (기본값: 'newest')
 * @returns 노트 목록과 페이지네이션 정보
 */
export async function getNotesList(page: number = 1, limit: number = 10, sortBy: SortOption = 'newest') {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('인증이 필요합니다.')
    }

    // 노트 목록 조회
    const result = await getNotesByUserId(user.id, page, limit, sortBy)
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('노트 목록 조회 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 목록을 불러오는데 실패했습니다.'
    }
  }
}

/**
 * 노트 상세 조회 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @returns 노트 데이터 또는 에러 정보
 */
export async function getNoteDetail(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 상세 조회 (권한 검증 포함)
    const note = await getNoteById(noteId, user.id)
    
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
        code: 'NOT_FOUND'
      }
    }
    
    return {
      success: true,
      data: note
    }
  } catch (error) {
    console.error('노트 상세 조회 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트를 불러오는데 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트 수정 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @param title 수정할 제목
 * @param content 수정할 본문
 * @returns 수정 결과
 */
export async function updateNoteAction(
  noteId: string,
  title: string,
  content: string
) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 수정 (권한 검증 포함)
    const updatedNote = await updateNote(noteId, user.id, { title, content })
    
    if (!updatedNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 수정 권한이 없습니다.',
        code: 'NOT_FOUND'
      }
    }

    // AI 요약과 태그 자동 재생성 (내용이 변경된 경우)
    if (content && content.trim().length > 0) {
      // AI 처리를 백그라운드에서 실행 (사용자 대기 없이)
      Promise.all([
        generateSummaryAction(noteId, content, user.id),
        generateTagsAction(noteId, content, user.id)
      ]).catch(error => {
        console.error('AI 처리 중 오류 발생:', error)
        // AI 처리 실패는 사용자에게 알리지 않고 로그만 남김
      })
    }
    
    // 캐시 무효화
    revalidatePath('/dashboard')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: updatedNote,
      redirect: '/dashboard' // 노트 목록 페이지로 리다이렉트
    }
  } catch (error) {
    console.error('노트 수정 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 수정에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트 삭제 (소프트 삭제, 사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @returns 삭제 결과
 */
export async function deleteNoteAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 삭제 (권한 검증 포함)
    const deletedNote = await softDeleteNote(noteId, user.id)
    
    if (!deletedNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.',
        code: 'NOT_FOUND'
      }
    }

    // 캐시 무효화
    revalidatePath('/dashboard')
    revalidatePath(`/notes/${noteId}`)
    
    return {
      success: true,
      data: deletedNote,
      message: '노트가 삭제되었습니다.'
    }
  } catch (error) {
    console.error('노트 삭제 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 삭제에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트 복구 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @returns 복구 결과
 */
export async function restoreNoteAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 복구 (권한 검증 포함)
    const restoredNote = await restoreNote(noteId, user.id)
    
    if (!restoredNote) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 복구 권한이 없습니다.',
        code: 'NOT_FOUND'
      }
    }

    // 캐시 무효화
    revalidatePath('/dashboard')
    revalidatePath('/trash')
    
    return {
      success: true,
      data: restoredNote,
      message: '노트가 복구되었습니다.'
    }
  } catch (error) {
    console.error('노트 복구 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 복구에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트 영구 삭제 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @returns 영구 삭제 결과
 */
export async function permanentDeleteNoteAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 영구 삭제 (권한 검증 포함)
    const deleted = await permanentDeleteNote(noteId, user.id)
    
    if (!deleted) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.',
        code: 'NOT_FOUND'
      }
    }

    // 캐시 무효화
    revalidatePath('/trash')
    
    return {
      success: true,
      message: '노트가 영구 삭제되었습니다.'
    }
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 영구 삭제에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 휴지통 노트 목록 조회 (사용자 권한 검증 포함)
 * @param page 현재 페이지 (1부터 시작)
 * @param limit 페이지당 노트 수 (기본값: 10)
 * @returns 휴지통 노트 목록과 페이지네이션 정보
 */
export async function getTrashNotesAction(page: number = 1, limit: number = 10) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 휴지통 노트 목록 조회
    const result = await getTrashNotes(user.id, page, limit)
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('휴지통 노트 목록 조회 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '휴지통 노트 목록을 불러오는데 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 여러 노트를 한 번에 삭제 (소프트 삭제, 사용자 권한 검증 포함)
 * @param noteIds 삭제할 노트 ID 배열
 * @returns 삭제 결과
 */
export async function deleteMultipleNotesAction(noteIds: string[]) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 ID 배열이 비어있는지 확인
    if (!noteIds || noteIds.length === 0) {
      return {
        success: false,
        error: '삭제할 노트를 선택해주세요.',
        code: 'INVALID_INPUT'
      }
    }

    // 각 노트를 순차적으로 삭제
    const results = []
    const errors = []
    
    for (const noteId of noteIds) {
      try {
        const deletedNote = await softDeleteNote(noteId, user.id)
        if (deletedNote) {
          results.push(deletedNote)
        } else {
          errors.push(`노트 ${noteId}를 찾을 수 없거나 삭제 권한이 없습니다.`)
        }
      } catch {
        errors.push(`노트 ${noteId} 삭제 중 오류가 발생했습니다.`)
      }
    }

    // 캐시 무효화
    revalidatePath('/dashboard')
    
    if (errors.length > 0) {
      return {
        success: false,
        error: `일부 노트 삭제에 실패했습니다: ${errors.join(', ')}`,
        code: 'PARTIAL_FAILURE',
        data: { deletedCount: results.length, totalCount: noteIds.length }
      }
    }
    
    return {
      success: true,
      data: { deletedCount: results.length, totalCount: noteIds.length },
      message: `${results.length}개의 노트가 삭제되었습니다.`
    }
  } catch (error) {
    console.error('여러 노트 삭제 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 삭제에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트를 .txt 파일로 export (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @returns export된 파일 데이터
 */
export async function exportNoteAsTxt(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: '인증이 필요합니다.',
        code: 'UNAUTHORIZED'
      }
    }

    // 노트 조회 (권한 검증 포함)
    const note = await getNoteById(noteId, user.id)
    
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없습니다.',
        code: 'NOT_FOUND'
      }
    }

    // .txt 파일 내용 생성
    const exportContent = generateTxtContent(note)
    
    // 파일명 생성 (제목에서 특수문자 제거)
    const sanitizedTitle = note.title
      .replace(/[<>:"/\\|?*]/g, '') // Windows에서 사용할 수 없는 문자 제거
      .replace(/\s+/g, '_') // 공백을 언더스코어로 변경
      .substring(0, 50) // 최대 50자로 제한
    
    const fileName = `${sanitizedTitle || 'untitled_note'}_${new Date().toISOString().split('T')[0]}.txt`
    
    return {
      success: true,
      data: {
        fileName,
        content: exportContent,
        mimeType: 'text/plain; charset=utf-8'
      }
    }
  } catch (error) {
    console.error('노트 export 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '노트 export에 실패했습니다.',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * 노트 데이터를 .txt 파일 형식으로 변환
 * @param note 노트 데이터
 * @returns .txt 파일 내용
 */
function generateTxtContent(note: {
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
}): string {
  const lines: string[] = []
  
  // 헤더 정보
  lines.push('='.repeat(60))
  lines.push(`노트 제목: ${note.title}`)
  lines.push(`생성일: ${note.createdAt ? new Date(note.createdAt).toLocaleString('ko-KR') : '알 수 없음'}`)
  lines.push(`수정일: ${note.updatedAt ? new Date(note.updatedAt).toLocaleString('ko-KR') : '알 수 없음'}`)
  lines.push(`노트 ID: ${note.id}`)
  lines.push('='.repeat(60))
  lines.push('')
  
  // 노트 내용
  if (note.content) {
    lines.push(note.content)
  } else {
    lines.push('(내용 없음)')
  }
  
  lines.push('')
  lines.push('='.repeat(60))
  lines.push(`이 파일은 AI 메모장에서 ${new Date().toLocaleString('ko-KR')}에 export되었습니다.`)
  lines.push('='.repeat(60))
  
  return lines.join('\n')
}