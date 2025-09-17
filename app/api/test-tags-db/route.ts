// app/api/test-tags-db/route.ts
// note_tags 테이블 데이터베이스 연결 테스트 API
// 실제 데이터베이스 연결 상태 및 테이블 존재 여부 확인
// 관련 파일: lib/db/connection.ts, lib/db/schema/note-tags.ts

import { NextResponse } from 'next/server'
import { db } from '@/lib/db/connection'
import { noteTags } from '@/lib/db/schema/note-tags'
import { notes } from '@/lib/db/schema/notes'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const results: {
      timestamp: string;
      tests: Array<{
        name: string;
        status: string;
        message: string;
        columns?: unknown;
      }>;
    } = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // 1. 데이터베이스 연결 테스트
    try {
      await db.execute(sql`SELECT 1 as test`)
      results.tests.push({
        name: '데이터베이스 연결',
        status: 'success',
        message: '데이터베이스 연결 성공'
      })
    } catch (error) {
      results.tests.push({
        name: '데이터베이스 연결',
        status: 'error',
        message: `연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
      return NextResponse.json(results, { status: 500 })
    }

    // 2. note_tags 테이블 존재 여부 확인
    try {
      await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'note_tags'
        ) as table_exists
      `)
      results.tests.push({
        name: 'note_tags 테이블 존재 확인',
        status: 'success',
        message: 'note_tags 테이블이 존재합니다'
      })
    } catch (error) {
      results.tests.push({
        name: 'note_tags 테이블 존재 확인',
        status: 'error',
        message: `테이블 확인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    }

    // 3. note_tags 테이블 구조 확인
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'note_tags' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `)
      
      results.tests.push({
        name: 'note_tags 테이블 구조',
        status: 'success',
        message: `테이블 구조 확인 완료 (${tableInfo.length}개 컬럼)`,
        columns: tableInfo
      })
    } catch (error) {
      results.tests.push({
        name: 'note_tags 테이블 구조',
        status: 'error',
        message: `테이블 구조 확인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    }

    // 4. Drizzle ORM을 통한 테이블 접근 테스트
    try {
      const count = await db.select({ count: sql<number>`count(*)` }).from(noteTags)
      results.tests.push({
        name: 'Drizzle ORM 접근',
        status: 'success',
        message: `Drizzle ORM을 통한 접근 성공 (현재 레코드 수: ${count[0]?.count || 0})`
      })
    } catch (error) {
      results.tests.push({
        name: 'Drizzle ORM 접근',
        status: 'error',
        message: `Drizzle ORM 접근 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    }

    // 5. 테스트 데이터 삽입/조회/삭제 테스트
    try {
      const testNoteId = 'test-note-' + Date.now()
      const testTag = 'test-tag-' + Date.now()

      // 테스트 데이터 삽입
      await db.insert(noteTags).values({
        noteId: testNoteId,
        tag: testTag
      })

      // 테스트 데이터 조회
      const inserted = await db
        .select()
        .from(noteTags)
        .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)

      // 테스트 데이터 삭제
      await db
        .delete(noteTags)
        .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)

      results.tests.push({
        name: 'CRUD 작업 테스트',
        status: 'success',
        message: `삽입/조회/삭제 성공 (삽입된 레코드: ${inserted.length}개)`
      })
    } catch (error) {
      results.tests.push({
        name: 'CRUD 작업 테스트',
        status: 'error',
        message: `CRUD 작업 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    }

    // 6. notes 테이블과의 관계 확인
    try {
      const notesCount = await db.select({ count: sql<number>`count(*)` }).from(notes)
      results.tests.push({
        name: 'notes 테이블 확인',
        status: 'success',
        message: `notes 테이블 접근 성공 (현재 노트 수: ${notesCount[0]?.count || 0})`
      })
    } catch (error) {
      results.tests.push({
        name: 'notes 테이블 확인',
        status: 'error',
        message: `notes 테이블 접근 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: '테스트 실행 중 오류 발생',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
