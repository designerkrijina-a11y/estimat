import { NextResponse, type NextRequest } from "next/server"

// /admin 접근 여부만 가볍게 확인한다(쿠키 존재 여부, edge에서 서명 검증은 하지 않음).
// 실제 서명 검증과 권한(role) 확인은 각 페이지/서버 액션에서 lib/auth.ts의 getCurrentUser()로 한다.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === "/admin/login"
  const hasSession = Boolean(request.cookies.get("estimate_session")?.value)

  if (!hasSession && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  if (hasSession && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
