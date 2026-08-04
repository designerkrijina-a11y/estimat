"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyInteriorDashboardCredentials } from "@/lib/interiorDashboardAuth"
import { getEstimateRole } from "@/lib/estimateRoles"
import { buildSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth"

export async function login(formData: FormData) {
  const loginId = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!loginId || !password) {
    redirect(`/admin/login?error=${encodeURIComponent("이메일과 비밀번호를 입력해주세요.")}`)
  }

  const user = await verifyInteriorDashboardCredentials(loginId, password)
  if (!user) {
    redirect(`/admin/login?error=${encodeURIComponent("아이디 또는 비밀번호가 올바르지 않습니다.")}`)
  }

  const roleInfo = await getEstimateRole(user.loginId)
  if (!roleInfo) {
    redirect(
      `/admin/login?error=${encodeURIComponent("이 계정은 견적 계산기 관리자 권한이 없습니다. 수퍼관리자에게 문의하세요.")}`
    )
  }

  const cookieValue = buildSessionCookieValue({
    loginId: user.loginId,
    name: roleInfo.name || user.name,
    role: roleInfo.role,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect("/admin")
}

export async function logout() {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
  redirect("/admin/login")
}
