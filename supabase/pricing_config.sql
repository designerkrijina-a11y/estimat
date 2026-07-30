-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.pricing_config (
  id int primary key default 1,
  config jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pricing_config enable row level security;

drop policy if exists "anyone can read pricing" on public.pricing_config;
create policy "anyone can read pricing"
on public.pricing_config for select
to anon, authenticated
using (true);

drop policy if exists "authenticated can update pricing" on public.pricing_config;
create policy "authenticated can update pricing"
on public.pricing_config for update
to authenticated
using (id = 1)
with check (id = 1);

drop policy if exists "authenticated can insert pricing" on public.pricing_config;
create policy "authenticated can insert pricing"
on public.pricing_config for insert
to authenticated
with check (id = 1);

insert into public.pricing_config (id, config)
values (1, '{
  "finishPricePerSqm": 350000,
  "finishGradeModifiers": {"초급": 0.8, "중급": 1.0, "고급": 1.35, "프리미엄": 1.8},
  "buildingGradeModifiers": {"A": 0.28, "B": 0, "C": -0.05},
  "timeModifiers": {"주간": 0, "부분야간": 0.15, "전면야간": 0.32, "주말야간": 0.5},
  "roomPrices": {
    "executive": 8000000, "meetingLarge": 15000000, "meetingMid": 7000000, "meetingSmall": 4000000,
    "phoneBooth": 2000000, "storage": 1500000, "lounge": 18000000, "studio": 25000000,
    "oaRoom": 6000000, "serverRoom": 10000000
  },
  "optionalWork": {
    "demolitionPerSqm": 15570, "acousticPerSqm": 15000, "hvacPerSqm": 25000, "networkPerSqm": 12000,
    "avFlat": 4000000, "furniturePerEmployee": 570000, "serverRoomBuildFlat": 6000000, "customStoragePerSqm": 20000
  }
}'::jsonb)
on conflict (id) do nothing;
