// app/unauthorized.tsx
// 403 권한 없음 에러 페이지
// 다른 사용자의 노트에 접근했을 때 표시되는 페이지
// 관련 파일: app/notes/[id]/page.tsx, lib/notes/actions.ts

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Shield } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              접근 권한이 없습니다
            </CardTitle>
            <p className="text-gray-600 mt-2">
              이 노트에 접근할 권한이 없습니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                이 노트는 다른 사용자가 작성한 것으로 보입니다.
              </p>
              <p className="text-sm text-gray-500">
                자신의 노트만 조회할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full flex items-center justify-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>내 노트 보기</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전 페이지</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: '접근 권한이 없습니다 - AI 메모장',
  description: '이 노트에 접근할 권한이 없습니다.'
}
