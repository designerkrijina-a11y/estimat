import { EstimateCalculator } from "@/components/estimate-calculator"

export const metadata = {
  title: "오피스 인테리어 견적 계산기",
  description: "면적, 직원 수, 건물 등급, 공사 유형을 입력하면 예상 견적을 바로 확인할 수 있습니다.",
}

export default function EstimatePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">오피스 인테리어</p>
          <h1 className="text-pretty text-3xl font-bold tracking-tight md:text-4xl">견적 계산기</h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            공간 정보와 시공 조건을 입력하면 예상 견적 금액을 실시간으로 확인할 수 있습니다. 정확한 금액은 현장 조사 후
            확정됩니다.
          </p>
        </header>
        <EstimateCalculator />
      </div>
    </main>
  )
}
