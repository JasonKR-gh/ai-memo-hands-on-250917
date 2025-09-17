// app/test-tags-db/page.tsx
// note_tags 테이블 직접 데이터베이스 테스트
// 실제 데이터베이스 연결 상태 및 테이블 존재 여부 확인
// 관련 파일: lib/db/connection.ts, lib/db/schema/note-tags.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestTagsDbPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setResult('데이터베이스 연결 테스트 중...\n')
    
    try {
      const response = await fetch('/api/test-tags-db')
      const data = await response.json()
      
      if (response.ok) {
        setResult(prev => prev + `✅ 성공: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(prev => prev + `❌ 오류: ${data.error}`)
      }
    } catch (error) {
      setResult(prev => prev + `❌ 네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Note Tags 데이터베이스 테스트</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>데이터베이스 연결 및 테이블 확인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDatabaseConnection} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '테스트 중...' : '데이터베이스 테스트 실행'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">테스트 결과:</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
