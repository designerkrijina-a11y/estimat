import { cookies } from "next/headers"
import crypto from "crypto"

const SESSION_COOKIE = "estimate_session"
const SECRET = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me"

export type EstimateRole = "super_admin" | "admin" | "staff"

export type SessionPayload = {
  loginId: string
  name: string
  role: EstimateRole
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex")
}

export function encodeSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload)
  const b64 = Buffer.from(json, "utf8").toString("base64url")
  const sig = sign(b64)
  return `${b64}.${sig}`
}

export function decodeSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null
  const [b64, sig] = cookieValue.split(".")
  if (!b64 || !sig) return null
  const expected = sign(b64)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8")
    return JSON.parse(json) as SessionPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  return decodeSession(raw)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export function buildSessionCookieValue(payload: SessionPayload) {
  return encodeSession(payload)
}
