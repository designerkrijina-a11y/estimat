import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_PRICING, mergePricing } from "@/lib/pricing"
import { PricingManager } from "@/components/pricing-manager"

export const dynamic = "force-dynamic"

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: myProfile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single()
  if (myProfile?.role !== "super_admin" && myProfile?.role !== "admin") redirect("/admin")

  const { data } = await supabase.from("pricing_config").select("config").eq("id", 1).single()
  const config = data?.config ? mergePricing(data.config) : DEFAULT_PRICING

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
            ← 관리 보드로 돌아가기
          </Link>
          <h1 className="text-pretty text-3xl font-bold tracking-tight">단가 관리</h1>
          <p className="text-muted-foreground">
            견적 계산기에 사용되는 단가와 배율을 수정합니다. 저장하면 바로 실제 견적 계산기에 반영됩니다.
          </p>
        </header>

        <PricingManager config={config} />
      </div>
    </main>
  )
}
