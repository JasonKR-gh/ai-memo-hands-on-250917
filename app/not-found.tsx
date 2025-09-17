// app/not-found.tsx
// 404 에러 페이지
// 존재하지 않는 페이지나 노트에 접근했을 때 표시되는 페이지
// 관련 파일: app/notes/[id]/page.tsx, app/layout.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import { Home, Search } from 'lucide-react'

export const metadata = {
  title: '페이지를 찾을 수 없습니다 - AI 메모장',
  description: '요청하신 페이지를 찾을 수 없습니다.'
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              페이지를 찾을 수 없습니다
            </CardTitle>
            <p className="text-gray-600 mt-2">
              요청하신 페이지나 노트가 존재하지 않습니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                가능한 원인:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 잘못된 URL을 입력하셨습니다</li>
                <li>• 노트가 삭제되었습니다</li>
                <li>• 권한이 없는 노트에 접근했습니다</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full flex items-center justify-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>대시보드로</span>
                </Button>
              </Link>
              <BackButton className="flex-1 flex items-center justify-center space-x-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

