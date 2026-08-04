import { Pool } from "pg"
import bcrypt from "bcryptjs"

// "현장관리 대시보드" 앱과 로그인 계정을 공유하기 위해, 같은 Neon Postgres의 User 테이블을
// 직접 조회해서 아이디/비밀번호를 검증한다. 비밀번호는 그쪽 앱에서 만든 bcrypt 해시 그대로 비교한다.

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.INTERIOR_DASHBOARD_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    })
  }
  return pool
}

export type InteriorDashboardUser = {
  id: string
  loginId: string
  name: string
}

export async function verifyInteriorDashboardCredentials(
  loginId: string,
  password: string
): Promise<InteriorDashboardUser | null> {
  if (!process.env.INTERIOR_DASHBOARD_DATABASE_URL) {
    throw new Error("INTERIOR_DASHBOARD_DATABASE_URL 환경변수가 설정되지 않았습니다.")
  }

  const client = getPool()
  const { rows } = await client.query(
    `select id, "loginId", name, status, "passwordHash" from "User" where "loginId" = $1 limit 1`,
    [loginId]
  )
  const user = rows[0]
  if (!user || user.status !== "active") return null

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return null

  return { id: user.id, loginId: user.loginId, name: user.name }
}

// 계정 관리 화면에서 "이 아이디가 실제로 현장관리 대시보드에 있는 활성 계정인지" 확인할 때 쓴다.
// 비밀번호는 확인하지 않는다.
export async function findInteriorDashboardUser(loginId: string): Promise<InteriorDashboardUser | null> {
  if (!process.env.INTERIOR_DASHBOARD_DATABASE_URL) {
    throw new Error("INTERIOR_DASHBOARD_DATABASE_URL 환경변수가 설정되지 않았습니다.")
  }
  const client = getPool()
  const { rows } = await client.query(
    `select id, "loginId", name from "User" where "loginId" = $1 and status = 'active' limit 1`,
    [loginId]
  )
  const user = rows[0]
  if (!user) return null
  return { id: user.id, loginId: user.loginId, name: user.name }
}
