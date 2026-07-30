import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client — bypasses RLS entirely. Server-only, never import from a client component.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set as a Vercel environment variable.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
