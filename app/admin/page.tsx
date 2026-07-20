import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type EstimateRequest = {
  id: string
  created_at: string
  pyeong: number | null
  area_sqm: number | null
  employee_count: number | null
  building_grade: string | null
  construction_type: string | null
  estimated_price: number | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
}

const numberFmt = new Intl.NumberFormat("ko-KR")

function formatPrice(value: number | null) {
  if (value == null) return "-"
  return `${numberFmt.format(value)}원`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-muted-foreground">-</span>
  const styles: Record<string, string> = {
    A: "bg-primary/10 text-primary",
    B: "bg-accent text-accent-foreground",
    C: "bg-muted text-muted-foreground",
  }
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
        styles[grade] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {grade}
    </span>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("estimate_requests")
    .select("*")
    .order("created_at", { ascending: false })

  const rows = (data ?? []) as EstimateRequest[]

  const totalCount = rows.length
  const avgPrice =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + (r.estimated_price ?? 0), 0) / rows.length
      : 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">오피스 인테리어</p>
          <h1 className="text-pretty text-3xl font-bold tracking-tight">견적 요청 관리 보드</h1>
          <p className="text-muted-foreground">접수된 견적 요청을 최신순으로 확인하세요.</p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">총 요청 건수</p>
            <p className="mt-1 text-2xl font-bold">{numberFmt.format(totalCount)}건</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">평균 견적 금액</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(Math.round(avgPrice))}</p>
          </div>
        </section>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            데이터를 불러오지 못했습니다: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
            아직 접수된 견적 요청이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">접수일시</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">평수</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">전용면적</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">직원수</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">건물등급</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">공사유형</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">견적금액</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">담당자</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">연락처</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(row.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.pyeong != null ? `${row.pyeong}평` : "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.area_sqm != null ? `${row.area_sqm}㎡` : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.employee_count != null ? `${row.employee_count}명` : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <GradeBadge grade={row.building_grade} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{row.construction_type ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(row.estimated_price)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.contact_name ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col">
                        <span>{row.contact_phone ?? "-"}</span>
                        {row.contact_email && (
                          <span className="text-xs text-muted-foreground">{row.contact_email}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
