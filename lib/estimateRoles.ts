import { createAdminClient } from "@/lib/supabase/admin"
import type { EstimateRole } from "@/lib/auth"

export type EstimateAdminRow = {
  login_id: string
  name: string | null
  role: EstimateRole
  created_at: string
}

// 견적 계산기 관리자 화면 접근 권한은 이 테이블(estimate_admin_roles)에 등록된 계정만 가진다.
// 아이디/비밀번호 자체는 현장관리 대시보드의 User 테이블 것을 그대로 쓰고, 여기서는 "권한 등급"만 관리한다.
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
