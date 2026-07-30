"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing"

function num(formData: FormData, key: string, fallback: number) {
  const raw = formData.get(key)
  if (raw == null || raw === "") return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export async function updatePricing(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다." }

  const { data: profile } = await supabase.from("admin_profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "super_admin" && profile?.role !== "admin") {
    return { error: "관리자 이상만 단가를 수정할 수 있습니다." }
  }

  const d = DEFAULT_PRICING
  const debugEntries = Object.fromEntries(formData.entries())

  const config: PricingConfig = {
    finishPricePerSqm: num(formData, "finishPricePerSqm", d.finishPricePerSqm),
    finishGradeModifiers: {
      초급: num(formData, "finishGradeModifiers.초급", d.finishGradeModifiers.초급),
      중급: num(formData, "finishGradeModifiers.중급", d.finishGradeModifiers.중급),
      고급: num(formData, "finishGradeModifiers.고급", d.finishGradeModifiers.고급),
      프리미엄: num(formData, "finishGradeModifiers.프리미엄", d.finishGradeModifiers.프리미엄),
    },
    buildingGradeModifiers: {
      A: num(formData, "buildingGradeModifiers.A", d.buildingGradeModifiers.A),
      B: num(formData, "buildingGradeModifiers.B", d.buildingGradeModifiers.B),
      C: num(formData, "buildingGradeModifiers.C", d.buildingGradeModifiers.C),
    },
    timeModifiers: {
      주간: num(formData, "timeModifiers.주간", d.timeModifiers.주간),
      부분야간: num(formData, "timeModifiers.부분야간", d.timeModifiers.부분야간),
      전면야간: num(formData, "timeModifiers.전면야간", d.timeModifiers.전면야간),
      주말야간: num(formData, "timeModifiers.주말야간", d.timeModifiers.주말야간),
    },
    roomPrices: {
      executive: num(formData, "roomPrices.executive", d.roomPrices.executive),
      meetingLarge: num(formData, "roomPrices.meetingLarge", d.roomPrices.meetingLarge),
      meetingMid: num(formData, "roomPrices.meetingMid", d.roomPrices.meetingMid),
      meetingSmall: num(formData, "roomPrices.meetingSmall", d.roomPrices.meetingSmall),
      phoneBooth: num(formData, "roomPrices.phoneBooth", d.roomPrices.phoneBooth),
      storage: num(formData, "roomPrices.storage", d.roomPrices.storage),
      lounge: num(formData, "roomPrices.lounge", d.roomPrices.lounge),
      studio: num(formData, "roomPrices.studio", d.roomPrices.studio),
      oaRoom: num(formData, "roomPrices.oaRoom", d.roomPrices.oaRoom),
      serverRoom: num(formData, "roomPrices.serverRoom", d.roomPrices.serverRoom),
    },
    optionalWork: {
      demolitionPerSqm: num(formData, "optionalWork.demolitionPerSqm", d.optionalWork.demolitionPerSqm),
      acousticPerSqm: num(formData, "optionalWork.acousticPerSqm", d.optionalWork.acousticPerSqm),
      hvacPerSqm: num(formData, "optionalWork.hvacPerSqm", d.optionalWork.hvacPerSqm),
      networkPerSqm: num(formData, "optionalWork.networkPerSqm", d.optionalWork.networkPerSqm),
      avFlat: num(formData, "optionalWork.avFlat", d.optionalWork.avFlat),
      furniturePerEmployee: num(formData, "optionalWork.furniturePerEmployee", d.optionalWork.furniturePerEmployee),
      serverRoomBuildFlat: num(formData, "optionalWork.serverRoomBuildFlat", d.optionalWork.serverRoomBuildFlat),
      customStoragePerSqm: num(formData, "optionalWork.customStoragePerSqm", d.optionalWork.customStoragePerSqm),
    },
  }

  const { error } = await supabase
    .from("pricing_config")
    .upsert({ id: 1, config, updated_at: new Date().toISOString() })

  if (error) return { error: error.message, debugEntries }

  revalidatePath("/admin/pricing")
  revalidatePath("/estimate")
  return { success: true, debugEntries, debugConfig: config }
}
