export type PricingConfig = {
  finishPricePerSqm: number
  finishGradeModifiers: Record<"초급" | "중급" | "고급" | "프리미엄", number>
  buildingGradeModifiers: Record<"A" | "B" | "C", number>
  timeModifiers: Record<"주간" | "부분야간" | "전면야간" | "주말야간", number>
  roomPrices: Record<
    | "executive"
    | "meetingLarge"
    | "meetingMid"
    | "meetingSmall"
    | "phoneBooth"
    | "storage"
    | "lounge"
    | "studio"
    | "oaRoom"
    | "serverRoom",
    number
  >
  optionalWork: Record<
    | "demolitionPerSqm"
    | "acousticPerSqm"
    | "hvacPerSqm"
    | "networkPerSqm"
    | "avFlat"
    | "furniturePerEmployee"
    | "serverRoomBuildFlat"
    | "customStoragePerSqm",
    number
  >
}

export const DEFAULT_PRICING: PricingConfig = {
  finishPricePerSqm: 350_000,
  finishGradeModifiers: { 초급: 0.8, 중급: 1.0, 고급: 1.35, 프리미엄: 1.8 },
  buildingGradeModifiers: { A: 0.28, B: 0, C: -0.05 },
  timeModifiers: { 주간: 0, 부분야간: 0.15, 전면야간: 0.32, 주말야간: 0.5 },
  roomPrices: {
    executive: 8_000_000,
    meetingLarge: 15_000_000,
    meetingMid: 7_000_000,
    meetingSmall: 4_000_000,
    phoneBooth: 2_000_000,
    storage: 1_500_000,
    lounge: 18_000_000,
    studio: 25_000_000,
    oaRoom: 6_000_000,
    serverRoom: 10_000_000,
  },
  optionalWork: {
    demolitionPerSqm: 15_570,
    acousticPerSqm: 15_000,
    hvacPerSqm: 25_000,
    networkPerSqm: 12_000,
    avFlat: 4_000_000,
    furniturePerEmployee: 570_000,
    serverRoomBuildFlat: 6_000_000,
    customStoragePerSqm: 20_000,
  },
}

/** Deep-merges a possibly-partial config (e.g. from an older DB row) over the current defaults. */
export function mergePricing(partial: unknown): PricingConfig {
  const p = (partial ?? {}) as Partial<PricingConfig>
  return {
    finishPricePerSqm: p.finishPricePerSqm ?? DEFAULT_PRICING.finishPricePerSqm,
    finishGradeModifiers: { ...DEFAULT_PRICING.finishGradeModifiers, ...p.finishGradeModifiers },
    buildingGradeModifiers: { ...DEFAULT_PRICING.buildingGradeModifiers, ...p.buildingGradeModifiers },
    timeModifiers: { ...DEFAULT_PRICING.timeModifiers, ...p.timeModifiers },
    roomPrices: { ...DEFAULT_PRICING.roomPrices, ...p.roomPrices },
    optionalWork: { ...DEFAULT_PRICING.optionalWork, ...p.optionalWork },
  }
}
