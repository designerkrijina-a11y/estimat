import { EstimateWizard } from "@/components/estimate-wizard"

export const metadata = {
  title: "오피스 인테리어 견적 계산기",
  description: "5단계로 공간 정보, 마감등급, 공종을 선택하면 상세 견적서를 확인할 수 있습니다.",
}

export default function EstimatePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 print:py-2 md:px-8">
        <header className="mb-8 flex flex-col gap-2 text-center print:mb-1 print:gap-0.5">
          <p className="text-sm font-medium text-primary print:hidden">오피스 인테리어</p>
          <h1 className="text-pretty text-3xl font-bold tracking-tight print:text-base md:text-4xl">견적 계산기</h1>
          <p className="mx-auto max-w-2xl text-pretty leading-relaxed text-muted-foreground print:text-[10px] print:font-semibold print:leading-snug print:text-primary">
            공간 정보와 시공 조건을 단계별로 입력하면 상세 견적서를 확인할 수 있습니다. 정확한 금액은 현장 조사 후
            확정됩니다.
          </p>
        </header>
        <EstimateWizard />
      </div>
    </main>
  )
}
