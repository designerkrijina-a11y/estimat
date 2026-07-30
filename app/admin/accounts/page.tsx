import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AccountsManager, type AdminAccount } from "@/components/accounts-manager"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: myProfile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single()

  if (myProfile?.role !== "super_admin") redirect("/admin")

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, name, role, created_at")
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
          <p className="text-muted-foreground">관리자 계정을 추가하고 권한을 관리하세요.</p>
        </header>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            계정 목록을 불러오지 못했습니다: {error.message}
          </div>
        ) : (
          <AccountsManager accounts={accounts} currentUserId={user.id} />
        )}
      </div>
    </main>
  )
}
