import { login } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <h1 className="mb-1 text-xl font-bold">관리자 로그인</h1>
        <p className="mb-6 text-sm text-muted-foreground">견적 요청 관리 보드에 접근하려면 로그인하세요.</p>

        {params.error && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {params.error}
          </div>
        )}

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="admin@estimat.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  )
}
