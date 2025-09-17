// middleware.ts
// Next.js 미들웨어 - 인증 상태 관리 및 세션 새로고침
// Supabase 세션을 자동으로 새로고침하고 인증이 필요한 페이지를 보호
// 관련 파일: lib/supabase/server.ts, lib/supabase/client.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 세션 새로고침
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 경로들
  const protectedPaths = ['/dashboard', '/notes', '/trash', '/onboarding']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // 인증이 필요한 페이지에 접근할 때
  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근할 때
  if ((request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
