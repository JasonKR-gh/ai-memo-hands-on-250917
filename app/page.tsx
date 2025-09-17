import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogoutDialog } from '@/components/auth/logout-dialog'
import { PenTool, Search, Tag, Download } from 'lucide-react'

export default async function HomePage() {
    // 로그인 상태 확인 (선택적)
    const supabase = await createClient()
    
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    if (error || !user) {
        redirect('/signin')
    }

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1454991727061-be514eae86f7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
            }}
        >
            {/* 오버레이로 텍스트 가독성 향상 */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                AI 메모장
                            </h1>
                            <p className="text-white/90 mt-1 drop-shadow-md">
                                안녕하세요, {user.email}님! 👋
                            </p>
                        </div>
                        <LogoutDialog />
                    </div>
                </div>

                {/* 환영 메시지 */}
                <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">
                            대시보드에 오신 것을 환영합니다!
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            AI의 도움을 받아 똑똑하게 메모를 관리해보세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Link href="/dashboard">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    내 노트 보기
                                </Button>
                            </Link>
                            <Link href="/notes/new">
                                <Button variant="outline">
                                    새 노트 작성
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* 기능 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <PenTool className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">메모 작성</CardTitle>
                            <CardDescription>
                                텍스트 및 음성으로 메모를 작성하세요
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                <Tag className="w-6 h-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">AI 태깅</CardTitle>
                            <CardDescription>
                                AI가 자동으로 태그를 생성합니다
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-lg">
                                스마트 검색
                            </CardTitle>
                            <CardDescription>
                                강력한 검색과 필터링 기능
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                <Download className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">
                                데이터 내보내기
                            </CardTitle>
                            <CardDescription>
                                메모를 다양한 형식으로 내보내기
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* 빠른 액션 */}
                <Card>
                    <CardHeader>
                        <CardTitle>빠른 액션</CardTitle>
                        <CardDescription>
                            자주 사용하는 기능에 빠르게 접근하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/dashboard">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <PenTool className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <h3 className="font-medium">내 노트</h3>
                                        <p className="text-sm text-gray-500">작성한 노트 보기</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            
                            <Link href="/notes/new">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <PenTool className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <h3 className="font-medium">새 노트</h3>
                                        <p className="text-sm text-gray-500">노트 작성하기</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            
                            <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
                                <CardContent className="p-6 text-center">
                                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <h3 className="font-medium text-gray-400">검색</h3>
                                    <p className="text-sm text-gray-400">곧 출시 예정</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'AI 메모장 - 똑똑한 메모 관리',
    description: 'AI의 도움을 받아 효율적으로 메모를 관리하세요'
}
