// scripts/check-tags-table.ts
// note_tags 테이블 존재 여부 및 구조 확인 스크립트
// 데이터베이스 연결 상태 및 테이블 스키마 검증
// 관련 파일: lib/db/connection.ts, lib/db/schema/note-tags.ts

import { config } from 'dotenv'
import { sql } from 'drizzle-orm'

// 환경 변수 로드 (import 전에 실행)
config({ path: '.env.local' })

// 환경 변수 로드 후 import
import { db } from '../lib/db/connection'
import { noteTags } from '../lib/db/schema/note-tags'

async function checkTagsTable() {
  console.log('🔍 note_tags 테이블 확인 시작...\n')

  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...')
    await db.execute(sql`SELECT 1 as test`)
    console.log('✅ 데이터베이스 연결 성공\n')

    // 2. note_tags 테이블 존재 여부 확인
    console.log('2. note_tags 테이블 존재 여부 확인...')
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'note_tags'
      ) as table_exists
    `)
    console.log(`✅ 테이블 존재 여부: ${tableExists[0]?.table_exists}\n`)

    // 3. 테이블 구조 확인
    console.log('3. note_tags 테이블 구조 확인...')
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'note_tags' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 테이블 컬럼 정보:')
    columns.forEach((col: Record<string, unknown>) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    console.log()

    // 4. Drizzle ORM을 통한 접근 테스트
    console.log('4. Drizzle ORM 접근 테스트...')
    const count = await db.select({ count: sql<number>`count(*)` }).from(noteTags)
    console.log(`✅ Drizzle ORM 접근 성공 (현재 레코드 수: ${count[0]?.count || 0})\n`)

    // 5. CRUD 작업 테스트
    console.log('5. CRUD 작업 테스트...')
    const testNoteId = 'test-note-' + Date.now()
    const testTag = 'test-tag-' + Date.now()

    // 삽입
    console.log('   - 데이터 삽입 테스트...')
    await db.insert(noteTags).values({
      noteId: testNoteId,
      tag: testTag
    })
    console.log('   ✅ 데이터 삽입 성공')

    // 조회
    console.log('   - 데이터 조회 테스트...')
    const inserted = await db
      .select()
      .from(noteTags)
      .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)
    console.log(`   ✅ 데이터 조회 성공 (조회된 레코드: ${inserted.length}개)`)

    // 삭제
    console.log('   - 데이터 삭제 테스트...')
    await db
      .delete(noteTags)
      .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)
    console.log('   ✅ 데이터 삭제 성공\n')

    console.log('🎉 모든 테스트 통과! note_tags 테이블이 정상적으로 작동합니다.')

  } catch (error) {
    console.error('❌ 테스트 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
checkTagsTable()
  .then(() => {
    console.log('\n✅ 스크립트 실행 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
