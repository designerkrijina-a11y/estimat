import { createAdminClient } from "@/lib/supabase/admin"
import type { EstimateRole } from "@/lib/auth"

export type EstimateAdminRow = {
  login_id: string
  name: string | null
  role: EstimateRole
  created_at: string
}

// 견적 계산기 관리자 화면 접근 권한/등급은 이 테이블(estimate_admin_roles)에서 관리한다.
// 아이디/비밀번호 자체는 현장관리 대시보드의 User 테이블 것을 그대로 쓴다.
export async function getEstimateRole(loginId: string): Promise<{ role: EstimateRole; name: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("estimate_admin_roles")
    .select("role, name")
    .eq("login_id", loginId)
    .single()

  if (!data) return null
  return { role: data.role as EstimateRole, name: data.name ?? loginId }
}

// 로그인 시 호출한다. 현장관리 대시보드 계정이면 누구나 견적 계산기 관리자 화면에
// 기본적으로 "관리자(admin)" 등급으로 접근 가능하고, 처음 로그인하는 순간 이 테이블에 자동으로 등록된다.
// 수퍼관리자 지정은 계정관리 화면에서 수동으로만 한다(자동 승격 없음).
export async function getOrCreateEstimateRole(
  loginId: string,
  dashboardName: string
): Promise<{ role: EstimateRole; name: string }> {
  const existing = await getEstimateRole(loginId)
  if (existing) return existing

  const admin = createAdminClient()
  await admin
    .from("estimate_admin_roles")
    .upsert({ login_id: loginId, name: dashboardName, role: "admin" })

  return { role: "admin", name: dashboardName }
}
