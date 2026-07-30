"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("로그인이 필요합니다.")

  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") throw new Error("수퍼관리자만 사용할 수 있는 기능입니다.")

  return user
}

export async function createAccount(formData: FormData) {
  try {
    await requireSuperAdmin()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const role = String(formData.get("role") ?? "staff")

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." }
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." }
  }
  if (!["super_admin", "admin", "staff"].includes(role)) {
    return { error: "올바르지 않은 권한입니다." }
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { error: error?.message ?? "계정 생성에 실패했습니다." }
  }

  const { error: profileError } = await admin.from("admin_profiles").insert({
    id: data.user.id,
    email,
    name: name || null,
    role,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: profileError.message }
  }

  revalidatePath("/admin/accounts")
  return { success: true }
}

export async function updateAccountRole(id: string, role: string) {
  try {
    await requireSuperAdmin()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  if (!["super_admin", "admin", "staff"].includes(role)) {
    return { error: "올바르지 않은 권한입니다." }
  }

  const admin = createAdminClient()
  const { error } = await admin.from("admin_profiles").update({ role }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/accounts")
  return { success: true }
}

export async function deleteAccount(id: string) {
  let currentUserId: string
  try {
    currentUserId = (await requireSuperAdmin()).id
  } catch (e) {
    return { error: e instanceof Error ? e.message : "권한 확인에 실패했습니다." }
  }

  if (currentUserId === id) {
    return { error: "본인 계정은 삭제할 수 없습니다." }
  }

  const admin = createAdminClient()
  const { error: authError } = await admin.auth.admin.deleteUser(id)
  if (authError) return { error: authError.message }

  await admin.from("admin_profiles").delete().eq("id", id)

  revalidatePath("/admin/accounts")
  return { success: true }
}
