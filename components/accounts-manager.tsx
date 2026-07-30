"use client"

import { useState, useTransition } from "react"
import { createAccount, deleteAccount, updateAccountRole } from "@/app/admin/accounts/actions"

export type AdminAccount = {
  id: string
  email: string
  name: string | null
  role: "super_admin" | "admin" | "staff"
  created_at: string
}

const ROLE_LABEL: Record<AdminAccount["role"], string> = {
  super_admin: "수퍼관리자",
  admin: "관리자",
  staff: "담당자",
}

export function AccountsManager({ accounts, currentUserId }: { accounts: AdminAccount[]; currentUserId: string }) {
  const [rows, setRows] = useState(accounts)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createAccount(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setShowForm(false)
      window.location.reload()
    })
  }

  function handleRoleChange(id: string, role: string) {
    setError(null)
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role: role as AdminAccount["role"] } : r)))
    startTransition(async () => {
      const result = await updateAccountRole(id, role)
      if (result?.error) {
        setError(result.error)
        window.location.reload()
      }
    })
  }

  function handleDelete(id: string, email: string) {
    if (!window.confirm(`${email} 계정을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount(id)
      if (result?.error) {
        setError(result.error)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {showForm ? "취소" : "+ 새 계정 추가"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-56 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              placeholder="name@company.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="password">
              초기 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              minLength={6}
              className="w-40 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              placeholder="6자 이상"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="name">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-32 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              placeholder="홍길동"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="role">
              권한
            </label>
            <select
              id="role"
              name="role"
              defaultValue="staff"
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="staff">담당자</option>
              <option value="admin">관리자</option>
              <option value="super_admin">수퍼관리자</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "생성 중..." : "계정 생성"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">이메일</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">이름</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">권한</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">가입일</th>
              <th className="px-4 py-3 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3">{row.email}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.name ?? "-"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={row.role}
                    disabled={isPending || row.id === currentUserId}
                    onChange={(e) => handleRoleChange(row.id, e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="staff">담당자</option>
                    <option value="admin">관리자</option>
                    <option value="super_admin">수퍼관리자</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {row.id !== currentUserId && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(row.id, row.email)}
                      className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {ROLE_LABEL.super_admin} 은 계정 관리 권한, {ROLE_LABEL.admin}/{ROLE_LABEL.staff} 는 견적 요청 조회 권한만
        갖습니다. 본인 계정의 권한은 변경하거나 삭제할 수 없습니다.
      </p>
    </div>
  )
}
