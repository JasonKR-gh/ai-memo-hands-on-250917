// components/onboarding/empty-state.tsx
// 개선된 빈 상태 UI 컴포넌트
// 신규 사용자를 위한 매력적인 빈 상태와 첫 메모 작성 유도
// 관련 파일: components/notes/note-list.tsx, app/notes/new/page.tsx

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PenTool, Sparkles, FileText, Search, Download, Plus } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  isNewUser?: boolean
  className?: string
}

export function EmptyState({ isNewUser = false, className }: EmptyStateProps) {
  if (isNewUser) {
    return (
      <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20`}>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">
            🎉 AI 메모장에 오신 것을 환영합니다!
          </CardTitle>
          <CardDescription className="text-center text-lg text-gray-200">
            첫 번째 메모를 작성하고 AI의 도움을 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {/* 환영 메시지와 아이콘 */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                똑똑한 메모 관리의 시작
              </h3>
              <p className="text-gray-200 max-w-md mx-auto">
                AI가 자동으로 요약하고 태그를 생성해드려서, 
                나중에 쉽게 찾을 수 있습니다.
              </p>
            </div>

            {/* 기능 소개 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 p-4 rounded-lg">
                <FileText className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <h4 className="font-medium text-blue-200 mb-1">텍스트 메모</h4>
                <p className="text-sm text-blue-300">키보드로 빠르게 작성</p>
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 p-4 rounded-lg">
                <Search className="w-8 h-8 text-green-300 mx-auto mb-2" />
                <h4 className="font-medium text-green-200 mb-1">스마트 검색</h4>
                <p className="text-sm text-green-300">AI가 내용을 이해해서 검색</p>
              </div>
              <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 p-4 rounded-lg">
                <Download className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <h4 className="font-medium text-purple-200 mb-1">데이터 내보내기</h4>
                <p className="text-sm text-purple-300">언제든지 데이터 백업</p>
              </div>
            </div>

            {/* 첫 메모 작성 CTA */}
            <div className="space-y-4">
              <Link href="/notes/new">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  첫 번째 메모 작성하기
                </Button>
              </Link>
              <p className="text-sm text-gray-300">
                💡 팁: 메모를 작성하면 AI가 자동으로 요약과 태그를 생성해드립니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 기존 사용자를 위한 기본 빈 상태
  return (
    <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20`}>
      <CardHeader>
        <CardTitle className="text-white">아직 노트가 없습니다</CardTitle>
        <CardDescription className="text-gray-200">
          첫 번째 노트를 작성해보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            첫 번째 노트를 작성해보세요
          </h3>
          <p className="text-gray-300 mb-6">
            AI가 자동으로 요약하고 태그를 생성해드립니다
          </p>
          <Link href="/notes/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              노트 작성하기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
