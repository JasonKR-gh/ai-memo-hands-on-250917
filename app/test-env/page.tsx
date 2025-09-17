// app/test-env/page.tsx
// 환경 변수 테스트 페이지
// Supabase 환경 변수가 제대로 로드되는지 확인

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getEnvStatus, validateRequiredEnv } from '@/lib/env'

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseAnonKey: boolean
  } | null>(null)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    try {
      // 환경 변수 상태 확인
      const status = getEnvStatus()
      const validation = validateRequiredEnv()

      setEnvStatus({
        supabaseUrl: status.client.supabaseUrl,
        supabaseAnonKey: status.client.supabaseAnonKey,
      })

      console.log('Environment variables check:', status)
      console.log('Validation result:', validation)

      if (!validation.isValid) {
        setError(`환경 변수 검증 실패: ${validation.errors.join(', ')}`)
      }

    } catch (err) {
      setError(`환경 변수 확인 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      // Supabase 클라이언트 생성 테스트
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // 간단한 연결 테스트
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error(`Supabase 연결 실패: ${error.message}`)
      }

      alert('✅ Supabase 연결 성공!')
    } catch (err) {
      alert(`❌ Supabase 연결 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>대시보드로 돌아가기</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">환경 변수 테스트</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* 환경 변수 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>환경 변수 상태</CardTitle>
            </CardHeader>
            <CardContent>
              {envStatus ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${envStatus.supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>NEXT_PUBLIC_SUPABASE_URL: {envStatus.supabaseUrl ? '설정됨' : '미설정'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${envStatus.supabaseAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.supabaseAnonKey ? '설정됨' : '미설정'}</span>
                  </div>
                </div>
              ) : (
                <div>환경 변수 확인 중...</div>
              )}
            </CardContent>
          </Card>

          {/* 서버 사이드 환경 변수 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>서버 사이드 환경 변수 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-3">
                서버 사이드에서만 접근 가능한 환경 변수들입니다.
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>GEMINI_API_KEY: 서버에서만 사용</span>
                </div>
                <div className="text-xs text-gray-500">
                  클라이언트에서는 확인할 수 없습니다. 서버 로그를 확인하세요.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supabase 연결 테스트 */}
          <Card>
            <CardHeader>
              <CardTitle>Supabase 연결 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testSupabaseConnection} className="w-full">
                Supabase 연결 테스트
              </Button>
            </CardContent>
          </Card>

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>에러:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* 해결 방법 */}
          <Card>
            <CardHeader>
              <CardTitle>문제 해결 방법</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p><strong>1. .env.local 파일 확인:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>프로젝트 루트에 .env.local 파일이 있는지 확인</li>
                  <li>클라이언트용: NEXT_PUBLIC_ 접두사가 있는지 확인</li>
                  <li>서버용: GEMINI_API_KEY 등 서버 전용 변수 확인</li>
                  <li>값이 올바르게 설정되어 있는지 확인</li>
                </ul>
              </div>
              
              <div className="text-sm">
                <p><strong>2. 개발 서버 재시작:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>환경 변수 변경 후 개발 서버를 재시작해야 함</li>
                  <li><code>pnpm dev</code> 명령어로 재시작</li>
                </ul>
              </div>

              <div className="text-sm">
                <p><strong>3. 브라우저 캐시 클리어:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>브라우저 캐시를 클리어하고 새로고침</li>
                  <li>개발자 도구에서 Application → Storage → Clear storage</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
