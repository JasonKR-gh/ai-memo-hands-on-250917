// lib/db/connection.ts
// Drizzle ORM 데이터베이스 연결 설정
// Supabase PostgreSQL 데이터베이스에 직접 연결
// 관련 파일: drizzle.config.ts, lib/db/schema/*.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.')
}

// PostgreSQL 연결 생성 (연결 타임아웃 설정)
const connection = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Drizzle 인스턴스 생성
export const db = drizzle(connection, { schema })
