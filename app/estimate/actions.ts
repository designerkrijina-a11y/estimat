"use server"

import { createClient } from "@/lib/supabase/server"

export type EstimateSubmission = {
  pyeong: number
  area_sqm: number
  employee_count: number
  building_grade: "A" | "B" | "C"
  construction_type: "신규" | "리모델링"
  estimated_price: number
  contact_name: string
  contact_phone: string
  contact_email: string
}

export async function submitEstimate(input: EstimateSubmission) {
  const supabase = await createClient()

  const { error } = await supabase.from("estimate_requests").insert({
    pyeong: input.pyeong,
    area_sqm: input.area_sqm,
    employee_count: input.employee_count,
    building_grade: input.building_grade,
    construction_type: input.construction_type,
    estimated_price: input.estimated_price,
    contact_name: input.contact_name || null,
    contact_phone: input.contact_phone || null,
    contact_email: input.contact_email || null,
  })

  if (error) {
    return { ok: false as const, error: error.message }
  }

  return { ok: true as const }
}
