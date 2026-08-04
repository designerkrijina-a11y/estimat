"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth"
import { findInteriorDashboardUser } from "@/lib/interiorDashboardAuth"

async function requireSuperAdmin() {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("로그인이 필요합니다.")
  if (currentUser.role !== "super_admin") throw new Error("수퍼관리자만 사용할 수 있는 기능입니다.")
  return currentUser
}

// 아이디/비밀번호는 만들지 않는다 — 현장관리 대시보드에 이미 있는 계정에게
// 이 견적 계산기 관리자 화면 접근 권한(등급)만 추가한다.
export async function addAccount(formData: FormData) {
  try {
    await requireSuperAdmin()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  const loginId = String(formData.get("email") ?? "").trim()
  const role = String(formData.get("role") ?? "staff")

  if (!loginId) {
    return { error: "이메일(현장관리 대시보드 아이디)을 입력해주세요." }
  }
  if (!["super_admin", "admin", "staff"].includes(role)) {
    return { error: "올바르지 않은 권한입니다." }
  }

  const dashboardUser = await findInteriorDashboardUser(loginId).catch(() => null)
  if (!dashboardUser) {
    return { error: "현장관리 대시보드에 이 이메일로 된 활성 계정이 없습니다." }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("estimate_admin_roles")
    .upsert({ login_id: dashboardUser.loginId, name: dashboardUser.name, role })

  if (error) return { error: error.message }

  revalidatePath("/admin/accounts")
  return { success: true }
}

export async function updateAccountRole(loginId: string, role: string) {
  try {
    await requireSuperAdmin()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  if (!["super_admin", "admin", "staff"].includes(role)) {
    return { error: "올바르지 않은 권한입니다." }
  }

  const admin = createAdminClient()
  const { error } = await admin.from("estimate_admin_roles").update({ role }).eq("login_id", loginId)

  if (error) return { error: error.message }

  revalidatePath("/admin/accounts")
  return { success: true }
}

export async function deleteAccount(loginId: string) {
  let currentLoginId: string
  try {
    currentLoginId = (await requireSuperAdmin()).loginId
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  if (currentLoginId === loginId) {
    return { error: "본인 계정은 삭제할 수 없습니다." }
  }

  const admin = createAdminClient()
  const { error } = await admin.from("estimate_admin_roles").delete().eq("login_id", loginId)
  if (error) return { error: error.message }

  revalidatePath("/admin/accounts")
  return { success: true }
}
