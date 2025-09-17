// scripts/test-tags-final.ts
// note_tags 테이블 최종 테스트 스크립트
// 올바른 UUID 형식으로 CRUD 작업 테스트
// 관련 파일: lib/db/schema/note-tags.ts

import { config } from 'dotenv'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// 환경 변수 로드
config({ path: '.env.local' })

// 환경 변수 로드 후 import
import { db } from '../lib/db/connection'
import { noteTags } from '../lib/db/schema/note-tags'

async function testTagsFinal() {
  console.log('🧪 note_tags 테이블 최종 테스트 시작...\n')

  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...')
    await db.execute(sql`SELECT 1 as test`)
    console.log('✅ 데이터베이스 연결 성공\n')

    // 2. 테이블 존재 여부 확인
    console.log('2. note_tags 테이블 존재 여부 확인...')
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'note_tags'
      ) as table_exists
    `)
    console.log(`✅ 테이블 존재 여부: ${tableExists[0]?.table_exists}\n`)

    // 3. Drizzle ORM을 통한 접근 테스트
    console.log('3. Drizzle ORM 접근 테스트...')
    const count = await db.execute(sql`SELECT count(*) FROM "note_tags"`)
    console.log(`✅ Drizzle ORM 접근 성공 (현재 레코드 수: ${count[0]?.count || 0})\n`)

    // 4. CRUD 작업 테스트 (올바른 UUID 사용)
    console.log('4. CRUD 작업 테스트...')
    const testNoteId = randomUUID()
    const testTag = 'test-tag-' + Date.now()

    // 삽입 (Drizzle ORM 사용)
    console.log('   - 데이터 삽입 테스트...')
    await db.insert(noteTags).values({
      noteId: testNoteId,
      tag: testTag
    })
    console.log('   ✅ 데이터 삽입 성공')

    // 조회 (Drizzle ORM 사용)
    console.log('   - 데이터 조회 테스트...')
    const inserted = await db
      .select()
      .from(noteTags)
      .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)
    console.log(`   ✅ 데이터 조회 성공 (조회된 레코드: ${inserted.length}개)`)
    console.log(`   📋 조회된 데이터:`, inserted[0])

    // 삭제 (Drizzle ORM 사용)
    console.log('   - 데이터 삭제 테스트...')
    await db
      .delete(noteTags)
      .where(sql`note_id = ${testNoteId} AND tag = ${testTag}`)
    console.log('   ✅ 데이터 삭제 성공\n')

    // 5. 여러 태그 삽입 테스트
    console.log('5. 여러 태그 삽입 테스트...')
    const testNoteId2 = randomUUID()
    const testTags = ['작업', '중요', '회의', '프로젝트']

    await db.insert(noteTags).values(
      testTags.map(tag => ({
        noteId: testNoteId2,
        tag: tag
      }))
    )
    console.log(`   ✅ ${testTags.length}개 태그 삽입 성공`)

    // 조회
    const allTags = await db
      .select()
      .from(noteTags)
      .where(sql`note_id = ${testNoteId2}`)
    console.log(`   📋 조회된 태그:`, allTags.map(t => t.tag).join(', '))

    // 정리
    await db
      .delete(noteTags)
      .where(sql`note_id = ${testNoteId2}`)
    console.log('   ✅ 테스트 데이터 정리 완료\n')

    console.log('🎉 note_tags 테이블 최종 테스트 완료! 모든 기능이 정상 작동합니다!')

  } catch (error) {
    console.error('❌ 테스트 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
testTagsFinal()
  .then(() => {
    console.log('\n✅ 스크립트 실행 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
