import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUser } from "@/lib/auth"
import { AccountsManager, type AdminAccount } from "@/components/accounts-manager"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect("/admin/login")
  if (currentUser.role !== "super_admin") redirect("/admin")

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("estimate_admin_roles")
    .select("login_id, name, role, created_at")
    .order("created_at", { ascending: true })

  const accounts = (data ?? []) as AdminAccount[]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
            ← 관리 보드로 돌아가기
          </Link>
          <h1 className="text-pretty text-3xl font-bold tracking-tight">계정 관리</h1>
          <p className="text-muted-foreground">
            현장관리 대시보드 계정으로 로그인하면 자동으로 관리자 등급이 부여됩니다. 이 화면에서는 등급을
            바꾸거나(예: 수퍼관리자로 승격), 아직 로그인하지 않은 사람을 미리 등록할 수 있습니다.
            아이디/비밀번호는 여기서 만들지 않고, 현장관리 대시보드 계정을 그대로 씁니다.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            계정 목록을 불러오지 못했습니다: {error.message}
          </div>
        ) : (
          <AccountsManager accounts={accounts} currentLoginId={currentUser.loginId} />
        )}
      </div>
    </main>
  )
}
