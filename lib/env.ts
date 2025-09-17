// lib/env.ts
// 환경 변수 유틸리티
// 환경 변수를 안전하게 로드하고 검증하는 함수들

/**
 * 클라이언트 사이드에서 접근 가능한 환경 변수들
 */
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const

/**
 * 서버 사이드에서만 접근 가능한 환경 변수들
 */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
  GEMINI_MAX_TOKENS: process.env.GEMINI_MAX_TOKENS || '8192',
  GEMINI_TIMEOUT_MS: process.env.GEMINI_TIMEOUT_MS || '10000',
  DATABASE_URL: process.env.DATABASE_URL,
} as const

/**
 * 필수 환경 변수 검증
 */
export function validateRequiredEnv() {
  const errors: string[] = []

  // 클라이언트 사이드 필수 변수들
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }

  if (!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // 서버 사이드 필수 변수들 (서버에서만 체크)
  if (typeof window === 'undefined') {
    if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
    }

    if (!serverEnv.GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY is required')
    }

    if (!serverEnv.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 환경 변수 상태 확인
 */
export function getEnvStatus() {
  return {
    client: {
      supabaseUrl: !!clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    server: typeof window === 'undefined' ? {
      serviceRoleKey: !!serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      geminiApiKey: !!serverEnv.GEMINI_API_KEY,
      databaseUrl: !!serverEnv.DATABASE_URL,
    } : null
  }
}
