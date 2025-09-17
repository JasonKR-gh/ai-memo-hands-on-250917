// scripts/apply-tags-migration.ts
// note_tags 테이블 마이그레이션 직접 적용 스크립트
// 데이터베이스에 테이블 생성 및 구조 확인
// 관련 파일: drizzle/0004_futuristic_blackheart.sql

import { config } from 'dotenv'
import { sql } from 'drizzle-orm'

// 환경 변수 로드
config({ path: '.env.local' })

// 환경 변수 로드 후 import
import { db } from '../lib/db/connection'

async function applyTagsMigration() {
  console.log('🔧 note_tags 테이블 마이그레이션 적용 시작...\n')

  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...')
    await db.execute(sql`SELECT 1 as test`)
    console.log('✅ 데이터베이스 연결 성공\n')

    // 2. note_tags 테이블 생성
    console.log('2. note_tags 테이블 생성...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "note_tags" (
        "note_id" uuid NOT NULL,
        "tag" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now(),
        CONSTRAINT "note_tags_note_id_tag_pk" PRIMARY KEY("note_id","tag")
      )
    `)
    console.log('✅ note_tags 테이블 생성 완료\n')

    // 3. 테이블 존재 여부 확인
    console.log('3. 테이블 존재 여부 확인...')
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'note_tags'
      ) as table_exists
    `)
    console.log(`✅ 테이블 존재 여부: ${tableExists[0]?.table_exists}\n`)

    // 4. 테이블 구조 확인
    console.log('4. 테이블 구조 확인...')
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

    // 5. Drizzle ORM을 통한 접근 테스트
    console.log('5. Drizzle ORM 접근 테스트...')
    const count = await db.execute(sql`SELECT count(*) FROM "note_tags"`)
    console.log(`✅ Drizzle ORM 접근 성공 (현재 레코드 수: ${count[0]?.count || 0})\n`)

    // 6. CRUD 작업 테스트
    console.log('6. CRUD 작업 테스트...')
    const testNoteId = 'test-note-' + Date.now()
    const testTag = 'test-tag-' + Date.now()

    // 삽입
    console.log('   - 데이터 삽입 테스트...')
    await db.execute(sql`
      INSERT INTO "note_tags" ("note_id", "tag") 
      VALUES (${testNoteId}, ${testTag})
    `)
    console.log('   ✅ 데이터 삽입 성공')

    // 조회
    console.log('   - 데이터 조회 테스트...')
    const inserted = await db.execute(sql`
      SELECT * FROM "note_tags" 
      WHERE "note_id" = ${testNoteId} AND "tag" = ${testTag}
    `)
    console.log(`   ✅ 데이터 조회 성공 (조회된 레코드: ${inserted.length}개)`)

    // 삭제
    console.log('   - 데이터 삭제 테스트...')
    await db.execute(sql`
      DELETE FROM "note_tags" 
      WHERE "note_id" = ${testNoteId} AND "tag" = ${testTag}
    `)
    console.log('   ✅ 데이터 삭제 성공\n')

    console.log('🎉 note_tags 테이블 마이그레이션 완료! 모든 테스트 통과!')

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
applyTagsMigration()
  .then(() => {
    console.log('\n✅ 스크립트 실행 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
