"use client"

import { useState, useTransition } from "react"
import type { PricingConfig } from "@/lib/pricing"
import { updatePricing } from "@/app/admin/pricing/actions"

function Field({
  name,
  label,
  defaultValue,
  suffix,
  step = 1,
}: {
  name: string
  label: string
  defaultValue: number
  suffix: string
  step?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="number"
          step={step}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 pr-10 text-sm"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-semibold">{title}</p>
      {desc && <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      <div className={desc ? "mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3" : "mt-1 grid gap-3 sm:grid-cols-2 md:grid-cols-3"}>
        {children}
      </div>
    </div>
  )
}

export function PricingManager({ config }: { config: PricingConfig }) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await updatePricing(formData)
      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "저장되었습니다. 견적 계산기에 바로 반영됩니다." })
      }
    })
  }

  return (
    <form action={handleSave} className="flex flex-col gap-4">
      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-destructive/40 bg-destructive/5 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <Section title="기준 단가" desc="마감 공사비 계산의 기본이 되는 ㎡당 단가입니다.">
        <Field
          name="finishPricePerSqm"
          label="기준 단가 (㎡당)"
          defaultValue={config.finishPricePerSqm}
          suffix="원"
          step={10000}
        />
      </Section>

      <Section title="마감등급별 배율" desc="기준 단가에 곱해지는 배율입니다. 1.0 = 기준, 1.35 = 기준의 135%">
        <Field name="finishGradeModifiers.초급" label="초급 마감" defaultValue={config.finishGradeModifiers.초급} suffix="배" step={0.01} />
        <Field name="finishGradeModifiers.중급" label="중급 마감" defaultValue={config.finishGradeModifiers.중급} suffix="배" step={0.01} />
        <Field name="finishGradeModifiers.고급" label="고급 마감" defaultValue={config.finishGradeModifiers.고급} suffix="배" step={0.01} />
        <Field name="finishGradeModifiers.프리미엄" label="프리미엄 마감" defaultValue={config.finishGradeModifiers.프리미엄} suffix="배" step={0.01} />
      </Section>

      <Section title="건물등급별 가산율" desc="마감 공사비에 추가/차감되는 비율입니다. 0 = 기준, 0.28 = +28%, -0.05 = -5%">
        <Field name="buildingGradeModifiers.A" label="A급 프리미엄" defaultValue={config.buildingGradeModifiers.A} suffix="" step={0.01} />
        <Field name="buildingGradeModifiers.B" label="B급 일반 오피스" defaultValue={config.buildingGradeModifiers.B} suffix="" step={0.01} />
        <Field name="buildingGradeModifiers.C" label="C급 일반 건물" defaultValue={config.buildingGradeModifiers.C} suffix="" step={0.01} />
      </Section>

      <Section title="공사시간대별 할증율" desc="전체 공사비(마감+건물+공간+추가공종)에 추가되는 노무비 할증 비율입니다. 0.15 = +15%">
        <Field name="timeModifiers.주간" label="주간 공사" defaultValue={config.timeModifiers.주간} suffix="" step={0.01} />
        <Field name="timeModifiers.부분야간" label="부분 야간" defaultValue={config.timeModifiers.부분야간} suffix="" step={0.01} />
        <Field name="timeModifiers.전면야간" label="전면 야간" defaultValue={config.timeModifiers.전면야간} suffix="" step={0.01} />
        <Field name="timeModifiers.주말야간" label="주말·고강도 야간" defaultValue={config.timeModifiers.주말야간} suffix="" step={0.01} />
      </Section>

      <Section title="공간별 고정 비용" desc="공간구성 단계에서 개수/토글로 추가되는 항목별 고정 금액입니다.">
        <Field name="roomPrices.executive" label="대표이사실 / 임원실" defaultValue={config.roomPrices.executive} suffix="원" step={100000} />
        <Field name="roomPrices.meetingLarge" label="대회의실" defaultValue={config.roomPrices.meetingLarge} suffix="원" step={100000} />
        <Field name="roomPrices.meetingMid" label="중회의실" defaultValue={config.roomPrices.meetingMid} suffix="원" step={100000} />
        <Field name="roomPrices.meetingSmall" label="소회의실" defaultValue={config.roomPrices.meetingSmall} suffix="원" step={100000} />
        <Field name="roomPrices.phoneBooth" label="1인 작업실 / 폰부스" defaultValue={config.roomPrices.phoneBooth} suffix="원" step={100000} />
        <Field name="roomPrices.storage" label="창고" defaultValue={config.roomPrices.storage} suffix="원" step={100000} />
        <Field name="roomPrices.lounge" label="라운지 / 캔틴" defaultValue={config.roomPrices.lounge} suffix="원" step={100000} />
        <Field name="roomPrices.studio" label="스튜디오 / 촬영실" defaultValue={config.roomPrices.studio} suffix="원" step={100000} />
        <Field name="roomPrices.oaRoom" label="OA실 / 탕비실" defaultValue={config.roomPrices.oaRoom} suffix="원" step={100000} />
        <Field name="roomPrices.serverRoom" label="서버룸" defaultValue={config.roomPrices.serverRoom} suffix="원" step={100000} />
      </Section>

      <Section title="추가 공종 단가" desc="공종선택 단계의 추가 공종을 선택했을 때 더해지는 단가입니다.">
        <Field name="optionalWork.demolitionPerSqm" label="철거공사 (㎡당)" defaultValue={config.optionalWork.demolitionPerSqm} suffix="원" step={1000} />
        <Field name="optionalWork.acousticPerSqm" label="흡음공사 (㎡당)" defaultValue={config.optionalWork.acousticPerSqm} suffix="원" step={1000} />
        <Field name="optionalWork.hvacPerSqm" label="냉난방기공사 (㎡당)" defaultValue={config.optionalWork.hvacPerSqm} suffix="원" step={1000} />
        <Field name="optionalWork.networkPerSqm" label="통신공사 (㎡당)" defaultValue={config.optionalWork.networkPerSqm} suffix="원" step={1000} />
        <Field name="optionalWork.avFlat" label="영상장비 및 AV (고정)" defaultValue={config.optionalWork.avFlat} suffix="원" step={100000} />
        <Field name="optionalWork.furniturePerEmployee" label="사무가구 구매 (인당)" defaultValue={config.optionalWork.furniturePerEmployee} suffix="원" step={10000} />
        <Field name="optionalWork.serverRoomBuildFlat" label="서버실 구축 (고정)" defaultValue={config.optionalWork.serverRoomBuildFlat} suffix="원" step={100000} />
        <Field name="optionalWork.customStoragePerSqm" label="현장 맞춤 제작수납가구 (㎡당)" defaultValue={config.optionalWork.customStoragePerSqm} suffix="원" step={1000} />
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  )
}
