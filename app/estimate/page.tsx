import { EstimateWizard } from "@/components/estimate-wizard"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_PRICING, mergePricing } from "@/lib/pricing"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "오피스 인테리어 견적 계산기",
  description: "5단계로 공간 정보, 마감등급, 공종을 선택하면 상세 견적서를 확인할 수 있습니다.",
}

export default async function EstimatePage() {
  const supabase = await createClient()
  const { data } = await supabase.from("pricing_config").select("config").eq("id", 1).single()
  const pricing = data?.config ? mergePricing(data.config) : DEFAULT_PRICING

  return (
    <main className="min-h-screen bg-background text-foreground print:min-h-0">
      <div className="mx-auto max-w-6xl px-4 py-10 print:py-2 md:px-8">
        <header className="mb-8 flex flex-col gap-2 text-center print:mb-6 print:gap-0.5">
          <p className="text-sm font-medium text-primary print:hidden">오피스 인테리어</p>
          <h1 className="text-pretty text-3xl font-bold tracking-tight print:text-2xl md:text-4xl">견적 계산기</h1>
          <p className="mx-auto max-w-2xl text-pretty leading-relaxed text-muted-foreground print:text-[10px] print:font-semibold print:leading-snug print:text-primary">
            공간 정보와 시공 조건을 단계별로 입력하면 상세 견적서를 확인할 수 있습니다. 정확한 금액은 현장 조사 후
            확정됩니다.
          </p>
        </header>
        <EstimateWizard pricing={pricing} />
      </div>
    </main>
  )
}
