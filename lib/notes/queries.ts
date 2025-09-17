// lib/notes/queries.ts
// 노트 조회 관련 쿼리 함수들
// Drizzle ORM을 사용한 노트 목록 조회 및 페이지네이션
// 관련 파일: lib/db/schema/notes.ts, lib/db/connection.ts

import { db } from '@/lib/db/connection'
import { notes } from '@/lib/db/schema/notes'
import { summaries } from '@/lib/db/schema/summaries'
import { noteTags } from '@/lib/db/schema/note-tags'
import { eq, desc, asc, count, and, isNull, isNotNull } from 'drizzle-orm'

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

export interface NotesListResult {
  notes: Array<{
    id: string
    userId: string
    title: string
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    deletedBy: string | null
  }>
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * 사용자별 노트 목록을 페이지네이션과 함께 조회
 * @param userId 사용자 ID
 * @param page 현재 페이지 (1부터 시작)
 * @param limit 페이지당 노트 수 (기본값: 10)
 * @param sortBy 정렬 옵션 (기본값: 'newest')
 * @returns 노트 목록과 페이지네이션 정보
 */
export async function getNotesByUserId(
  userId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: SortOption = 'newest'
): Promise<NotesListResult> {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1
    if (limit < 1) limit = 10
    if (limit > 100) limit = 100 // 최대 100개로 제한

    const offset = (page - 1) * limit

    // 전체 노트 수 조회 (삭제되지 않은 노트만)
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))

    const totalCount = totalCountResult?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 정렬 옵션에 따른 orderBy 설정
    let orderByClause
    switch (sortBy) {
      case 'newest':
        orderByClause = desc(notes.updatedAt)
        break
      case 'oldest':
        orderByClause = asc(notes.updatedAt)
        break
      case 'title_asc':
        orderByClause = asc(notes.title)
        break
      case 'title_desc':
        orderByClause = desc(notes.title)
        break
      default:
        orderByClause = desc(notes.updatedAt)
    }

    // 노트 목록 조회 (정렬 옵션 적용, 삭제되지 않은 노트만)
    const notesList = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    return {
      notes: notesList,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  } catch (error) {
    console.error('노트 목록 조회 오류:', error)
    throw new Error('노트 목록을 불러오는데 실패했습니다.')
  }
}

/**
 * 사용자의 노트 총 개수 조회
 * @param userId 사용자 ID
 * @returns 노트 총 개수
 */
export async function getNotesCountByUserId(userId: string): Promise<number> {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))

    return result?.count || 0
  } catch (error) {
    console.error('노트 개수 조회 오류:', error)
    throw new Error('노트 개수를 불러오는데 실패했습니다.')
  }
}

/**
 * 노트 ID로 단일 노트 조회 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 노트 데이터 또는 null
 */
export async function getNoteById(
  noteId: string, 
  userId: string
): Promise<{
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
} | null> {
  try {
    const result = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId), isNull(notes.deletedAt)))
      .limit(1)
    
    return result[0] || null
  } catch (error) {
    console.error('노트 상세 조회 오류:', error)
    throw new Error('노트를 불러오는데 실패했습니다.')
  }
}

/**
 * 노트 수정 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @param data 수정할 데이터
 * @returns 수정된 노트 데이터 또는 null
 */
export async function updateNote(
  noteId: string,
  userId: string,
  data: { title?: string; content?: string }
): Promise<{
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
} | null> {
  try {
    // 빈 제목 처리
    const updateData = {
      ...data,
      title: data.title?.trim() || '제목 없음',
      updatedAt: new Date()
    }

    const result = await db
      .update(notes)
      .set(updateData)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId), isNull(notes.deletedAt)))
      .returning()
    
    return result[0] || null
  } catch (error) {
    console.error('노트 수정 오류:', error)
    throw new Error('노트 수정에 실패했습니다.')
  }
}

/**
 * 노트 소프트 삭제 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 삭제된 노트 데이터 또는 null
 */
export async function softDeleteNote(
  noteId: string,
  userId: string
): Promise<{
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
  deletedAt: Date | null
  deletedBy: string | null
} | null> {
  try {
    const now = new Date()
    const result = await db
      .update(notes)
      .set({
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning()
    
    return result[0] || null
  } catch (error) {
    console.error('노트 삭제 오류:', error)
    throw new Error('노트 삭제에 실패했습니다.')
  }
}

/**
 * 노트 복구 (사용자 권한 검증 포함)
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 복구된 노트 데이터 또는 null
 */
export async function restoreNote(
  noteId: string,
  userId: string
): Promise<{
  id: string
  userId: string
  title: string
  content: string | null
  createdAt: Date | null
  updatedAt: Date | null
  deletedAt: Date | null
  deletedBy: string | null
} | null> {
  try {
    const now = new Date()
    const result = await db
      .update(notes)
      .set({
        deletedAt: null,
        deletedBy: null,
        updatedAt: now
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning()
    
    return result[0] || null
  } catch (error) {
    console.error('노트 복구 오류:', error)
    throw new Error('노트 복구에 실패했습니다.')
  }
}

/**
 * 영구 삭제 (물리적 삭제)
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 삭제 성공 여부
 */
export async function permanentDeleteNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning()
    
    return result.length > 0
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error)
    throw new Error('노트 영구 삭제에 실패했습니다.')
  }
}

/**
 * 휴지통 노트 목록 조회 (삭제된 노트만)
 * @param userId 사용자 ID
 * @param page 현재 페이지 (1부터 시작)
 * @param limit 페이지당 노트 수 (기본값: 10)
 * @returns 삭제된 노트 목록과 페이지네이션 정보
 */
export async function getTrashNotes(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<NotesListResult> {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1
    if (limit < 1) limit = 10
    if (limit > 100) limit = 100 // 최대 100개로 제한

    const offset = (page - 1) * limit

    // 전체 삭제된 노트 수 조회
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .where(and(eq(notes.userId, userId), isNotNull(notes.deletedAt)))

    const totalCount = totalCountResult?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 삭제된 노트 목록 조회 (삭제일 최신순 정렬)
    const notesList = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), isNotNull(notes.deletedAt)))
      .orderBy(desc(notes.deletedAt))
      .limit(limit)
      .offset(offset)

    return {
      notes: notesList,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  } catch (error) {
    console.error('휴지통 노트 목록 조회 오류:', error)
    throw new Error('휴지통 노트 목록을 불러오는데 실패했습니다.')
  }
}

/**
 * 30일 경과된 삭제된 노트 조회 (자동 영구 삭제용)
 * @returns 30일 경과된 삭제된 노트 ID 목록
 */
export async function getExpiredDeletedNotes(): Promise<string[]> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(
        isNotNull(notes.deletedAt),
        eq(notes.deletedAt, thirtyDaysAgo)
      ))

    return result.map(note => note.id)
  } catch (error) {
    console.error('만료된 삭제 노트 조회 오류:', error)
    throw new Error('만료된 삭제 노트 조회에 실패했습니다.')
  }
}

/**
 * 노트의 요약 조회
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 요약 데이터 또는 null
 */
export async function getSummaryByNoteId(
  noteId: string,
  userId: string
): Promise<{
  id: string;
  noteId: string;
  model: string;
  content: string;
  createdAt: Date | null;
} | null> {
  try {
    // 먼저 노트 소유권 확인
    const note = await getNoteById(noteId, userId)
    if (!note) {
      return null
    }

    const result = await db
      .select()
      .from(summaries)
      .where(eq(summaries.noteId, noteId))
      .orderBy(desc(summaries.createdAt))
      .limit(1)
    
    return result[0] || null
  } catch (error) {
    console.error('요약 조회 오류:', error)
    throw new Error('요약을 불러오는데 실패했습니다.')
  }
}

/**
 * 요약 생성/업데이트
 * @param noteId 노트 ID
 * @param model AI 모델명
 * @param content 요약 내용
 * @returns 생성된 요약 데이터
 */
export async function createOrUpdateSummary(
  noteId: string,
  model: string,
  content: string
): Promise<{
  id: string;
  noteId: string;
  model: string;
  content: string;
  createdAt: Date | null;
}> {
  try {
    // 기존 요약이 있는지 확인
    const existingSummary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.noteId, noteId))
      .limit(1)

    if (existingSummary.length > 0) {
      // 기존 요약 업데이트
      const result = await db
        .update(summaries)
        .set({
          model,
          content,
          createdAt: new Date()
        })
        .where(eq(summaries.noteId, noteId))
        .returning()
      
      return result[0]
    } else {
      // 새 요약 생성
      const result = await db
        .insert(summaries)
        .values({
          noteId,
          model,
          content
        })
        .returning()
      
      return result[0]
    }
  } catch (error) {
    console.error('요약 생성/업데이트 오류:', error)
    throw new Error('요약 생성에 실패했습니다.')
  }
}

/**
 * 요약 삭제
 * @param noteId 노트 ID
 * @returns 삭제 성공 여부
 */
export async function deleteSummary(noteId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(summaries)
      .where(eq(summaries.noteId, noteId))
      .returning()
    
    return result.length > 0
  } catch (error) {
    console.error('요약 삭제 오류:', error)
    throw new Error('요약 삭제에 실패했습니다.')
  }
}

/**
 * 노트의 태그 조회
 * @param noteId 노트 ID
 * @param userId 사용자 ID
 * @returns 태그 목록
 */
export async function getTagsByNoteId(
  noteId: string,
  userId: string
): Promise<{
  noteId: string;
  tag: string;
  createdAt: Date | null;
}[]> {
  try {
    // 먼저 노트 소유권 확인
    const note = await getNoteById(noteId, userId)
    if (!note) {
      return []
    }

    const result = await db
      .select()
      .from(noteTags)
      .where(eq(noteTags.noteId, noteId))
      .orderBy(asc(noteTags.tag))
    
    return result
  } catch (error) {
    console.error('태그 조회 오류:', error)
    throw new Error('태그를 불러오는데 실패했습니다.')
  }
}

/**
 * 태그 생성/업데이트
 * @param noteId 노트 ID
 * @param tags 태그 배열
 * @returns 생성된 태그 데이터
 */
export async function createOrUpdateTags(
  noteId: string,
  tags: string[]
): Promise<{
  noteId: string;
  tag: string;
  createdAt: Date | null;
}[]> {
  try {
    // 기존 태그 삭제
    await db
      .delete(noteTags)
      .where(eq(noteTags.noteId, noteId))

    // 새 태그들 삽입
    if (tags.length > 0) {
      const tagData = tags.map(tag => ({
        noteId,
        tag: tag.trim()
      }))

      const result = await db
        .insert(noteTags)
        .values(tagData)
        .returning()
      
      return result
    }

    return []
  } catch (error) {
    console.error('태그 생성/업데이트 오류:', error)
    throw new Error('태그 생성에 실패했습니다.')
  }
}

/**
 * 태그 삭제
 * @param noteId 노트 ID
 * @returns 삭제 성공 여부
 */
export async function deleteTags(noteId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(noteTags)
      .where(eq(noteTags.noteId, noteId))
      .returning()
    
    return result.length > 0
  } catch (error) {
    console.error('태그 삭제 오류:', error)
    throw new Error('태그 삭제에 실패했습니다.')
  }
}

/**
 * 태그로 노트 검색
 * @param userId 사용자 ID
 * @param tag 검색할 태그
 * @param page 현재 페이지
 * @param limit 페이지당 노트 수
 * @returns 태그가 포함된 노트 목록
 */
export async function searchNotesByTag(
  userId: string,
  tag: string,
  page: number = 1,
  limit: number = 10
): Promise<NotesListResult> {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1
    if (limit < 1) limit = 10
    if (limit > 100) limit = 100

    const offset = (page - 1) * limit

    // 태그가 포함된 노트의 총 개수 조회
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(notes)
      .innerJoin(noteTags, eq(notes.id, noteTags.noteId))
      .where(and(
        eq(notes.userId, userId),
        eq(noteTags.tag, tag),
        isNull(notes.deletedAt)
      ))

    const totalCount = totalCountResult?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 태그가 포함된 노트 목록 조회
    const notesList = await db
      .select({
        id: notes.id,
        userId: notes.userId,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        deletedAt: notes.deletedAt,
        deletedBy: notes.deletedBy
      })
      .from(notes)
      .innerJoin(noteTags, eq(notes.id, noteTags.noteId))
      .where(and(
        eq(notes.userId, userId),
        eq(noteTags.tag, tag),
        isNull(notes.deletedAt)
      ))
      .orderBy(desc(notes.updatedAt))
      .limit(limit)
      .offset(offset)

    return {
      notes: notesList,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  } catch (error) {
    console.error('태그 검색 오류:', error)
    throw new Error('태그 검색에 실패했습니다.')
  }
}

/**
 * 사용자의 모든 태그 목록 조회
 * @param userId 사용자 ID
 * @returns 태그 목록과 사용 횟수
 */
export async function getAllTagsByUserId(
  userId: string
): Promise<Array<{
  tag: string;
  count: number;
}>> {
  try {
    const result = await db
      .select({
        tag: noteTags.tag,
        count: count()
      })
      .from(noteTags)
      .innerJoin(notes, eq(noteTags.noteId, notes.id))
      .where(and(
        eq(notes.userId, userId),
        isNull(notes.deletedAt)
      ))
      .groupBy(noteTags.tag)
      .orderBy(desc(count()))

    return result
  } catch (error) {
    console.error('태그 목록 조회 오류:', error)
    throw new Error('태그 목록을 불러오는데 실패했습니다.')
  }
}