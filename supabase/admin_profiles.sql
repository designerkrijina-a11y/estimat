-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null check (role in ('super_admin', 'admin', 'staff')),
  created_at timestamptz not null default now()
);

create or replace function public.current_admin_role()
returns text
language sql
security definer
stable
as $$
  select role from public.admin_profiles where id = auth.uid();
$$;

alter table public.admin_profiles enable row level security;

drop policy if exists "admins can view all profiles" on public.admin_profiles;
create policy "admins can view all profiles"
on public.admin_profiles for select
to authenticated
using (true);

drop policy if exists "only super admin can insert" on public.admin_profiles;
create policy "only super admin can insert"
on public.admin_profiles for insert
to authenticated
with check (public.current_admin_role() = 'super_admin');

drop policy if exists "only super admin can update" on public.admin_profiles;
create policy "only super admin can update"
on public.admin_profiles for update
to authenticated
using (public.current_admin_role() = 'super_admin');

drop policy if exists "only super admin can delete" on public.admin_profiles;
create policy "only super admin can delete"
on public.admin_profiles for delete
to authenticated
using (public.current_admin_role() = 'super_admin');

-- Seed the existing admin login as the first super_admin.
insert into public.admin_profiles (id, email, role, name)
select id, email, 'super_admin', '수퍼관리자'
from auth.users
where email = 'admin@estimat.com'
on conflict (id) do nothing;
