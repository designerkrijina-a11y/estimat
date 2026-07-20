"use client"

import { useMemo, useState } from "react"
import { Building2, CheckCircle2, Hammer, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { submitEstimate } from "@/app/estimate/actions"

const PYEONG_TO_SQM = 3.3
const BASE_PRICE_PER_SQM = 400_000
const DEMOLITION_PER_SQM = 15_570

const GRADES = [
  { value: "A", label: "A급 프리미엄", desc: "최고급 마감재 · 프리미엄 시공", modifier: 0.28 },
  { value: "B", label: "B급 일반", desc: "표준 사양의 균형 잡힌 구성", modifier: 0 },
  { value: "C", label: "C급 실속", desc: "합리적인 비용의 실속형 시공", modifier: -0.05 },
] as const

const CONSTRUCTION_TYPES = [
  { value: "신규", label: "신규 인테리어", desc: "빈 공간을 처음부터 시공", icon: Sparkles },
  { value: "리모델링", label: "리모델링", desc: "기존 공간 철거 후 재시공", icon: Hammer },
] as const

type Grade = (typeof GRADES)[number]["value"]
type ConstructionType = (typeof CONSTRUCTION_TYPES)[number]["value"]

const won = new Intl.NumberFormat("ko-KR")

function roundToTenThousand(value: number) {
  return Math.round(value / 10_000) * 10_000
}

export function EstimateCalculator() {
  const [pyeong, setPyeong] = useState("50")
  const [sqm, setSqm] = useState((50 * PYEONG_TO_SQM).toFixed(1))
  const [employeeCount, setEmployeeCount] = useState("20")
  const [grade, setGrade] = useState<Grade>("B")
  const [constructionType, setConstructionType] = useState<ConstructionType>("신규")

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  function handlePyeongChange(v: string) {
    setPyeong(v)
    const n = Number.parseFloat(v)
    setSqm(Number.isFinite(n) ? (n * PYEONG_TO_SQM).toFixed(1) : "")
  }

  function handleSqmChange(v: string) {
    setSqm(v)
    const n = Number.parseFloat(v)
    setPyeong(Number.isFinite(n) ? (n / PYEONG_TO_SQM).toFixed(1) : "")
  }

  const areaSqm = Number.parseFloat(sqm) || 0
  const pyeongNum = Number.parseFloat(pyeong) || 0
  const employees = Number.parseInt(employeeCount, 10) || 0

  const { basePrice, gradeAmount, demolition, total } = useMemo(() => {
    const base = areaSqm * BASE_PRICE_PER_SQM
    const gradeMod = GRADES.find((g) => g.value === grade)?.modifier ?? 0
    const graded = base * (1 + gradeMod)
    const demo = constructionType === "리모델링" ? areaSqm * DEMOLITION_PER_SQM : 0
    return {
      basePrice: base,
      gradeAmount: graded - base,
      demolition: demo,
      total: roundToTenThousand(graded + demo),
    }
  }, [areaSqm, grade, constructionType])

  const gradeMod = GRADES.find((g) => g.value === grade)?.modifier ?? 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)
    const res = await submitEstimate({
      pyeong: pyeongNum,
      area_sqm: areaSqm,
      employee_count: employees,
      building_grade: grade,
      construction_type: constructionType,
      estimated_price: total,
      contact_name: name.trim(),
      contact_phone: phone.trim(),
      contact_email: email.trim(),
    })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
    } else {
      setErrorMsg(res.error ?? "제출 중 오류가 발생했습니다.")
    }
  }

  function resetDialog() {
    setOpen(false)
    setTimeout(() => {
      setDone(false)
      setErrorMsg(null)
      setName("")
      setPhone("")
      setEmail("")
    }, 200)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Inputs */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-primary" />
              공간 정보
            </CardTitle>
            <CardDescription>전용면적은 평 또는 ㎡ 중 하나만 입력하면 자동 변환됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pyeong">전용면적 (평)</Label>
                <div className="relative">
                  <Input
                    id="pyeong"
                    inputMode="decimal"
                    value={pyeong}
                    onChange={(e) => handlePyeongChange(e.target.value)}
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    평
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sqm">전용면적 (㎡)</Label>
                <div className="relative">
                  <Input
                    id="sqm"
                    inputMode="decimal"
                    value={sqm}
                    onChange={(e) => handleSqmChange(e.target.value)}
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ㎡
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="employees" className="flex items-center gap-1.5">
                <Users className="size-4 text-muted-foreground" />
                입주 예정 직원 수
              </Label>
              <div className="relative">
                <Input
                  id="employees"
                  inputMode="numeric"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value.replace(/[^0-9]/g, ""))}
                  className="pr-12"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  명
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">건물 등급</CardTitle>
            <CardDescription>마감 사양에 따라 견적 금액이 조정됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {GRADES.map((g) => {
              const selected = grade === g.value
              const pct =
                g.modifier > 0 ? `+${Math.round(g.modifier * 100)}%` : g.modifier < 0 ? `${Math.round(g.modifier * 100)}%` : "기준"
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGrade(g.value)}
                  aria-pressed={selected}
                  className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-accent ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold">{g.label}</span>
                    <span
                      className={`text-xs font-medium ${selected ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {pct}
                    </span>
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{g.desc}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">공사 유형</CardTitle>
            <CardDescription>리모델링은 철거비(1㎡당 15,570원)가 추가됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {CONSTRUCTION_TYPES.map((c) => {
              const selected = constructionType === c.value
              const Icon = c.icon
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setConstructionType(c.value)}
                  aria-pressed={selected}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-accent ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Icon className={`mt-0.5 size-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="flex flex-col gap-1">
                    <span className="font-semibold">{c.label}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{c.desc}</span>
                  </span>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Estimate summary */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card className="border-primary/20">
          <CardHeader>
            <CardDescription>예상 견적 금액</CardDescription>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">
              {won.format(total)}원
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {pyeongNum ? `${won.format(pyeongNum)}평` : "-"} · {areaSqm ? `${won.format(areaSqm)}㎡` : "-"} ·{" "}
              {employees ? `${employees}명` : "-"}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">기본 시공비</dt>
                <dd>{won.format(Math.round(basePrice))}원</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">
                  건물 등급 ({grade}급 {gradeMod > 0 ? `+${Math.round(gradeMod * 100)}%` : gradeMod < 0 ? `${Math.round(gradeMod * 100)}%` : "기준"})
                </dt>
                <dd className={gradeAmount < 0 ? "text-destructive" : ""}>
                  {gradeAmount >= 0 ? "+" : ""}
                  {won.format(Math.round(gradeAmount))}원
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">철거비 {constructionType === "리모델링" ? "(리모델링)" : ""}</dt>
                <dd>{demolition > 0 ? `+${won.format(Math.round(demolition))}원` : "-"}</dd>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>합계</dt>
                <dd className="text-primary">{won.format(total)}원</dd>
              </div>
            </dl>

            <p className="rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              본 견적은 입력 정보를 바탕으로 한 예상 금액이며, 실제 현장 조사 후 확정됩니다.
            </p>

            <Button size="lg" className="w-full" disabled={total <= 0} onClick={() => setOpen(true)}>
              견적 요청하기
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : resetDialog())}>
        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <DialogHeader>
                <DialogTitle className="text-center">견적 요청이 접수되었습니다</DialogTitle>
                <DialogDescription className="text-center">
                  담당자가 확인 후 빠르게 연락드리겠습니다. 감사합니다.
                </DialogDescription>
              </DialogHeader>
              <Button className="mt-2 w-full" onClick={resetDialog}>
                확인
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>담당자 정보 입력</DialogTitle>
                <DialogDescription>
                  예상 견적 <span className="font-medium text-foreground">{won.format(total)}원</span> · 아래 정보를
                  남겨주시면 상세 견적을 안내해 드립니다.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">담당자 이름</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">이메일 (선택)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                {errorMsg && (
                  <p className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">{errorMsg}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "제출 중..." : "견적 요청 제출"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
