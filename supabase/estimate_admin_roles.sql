-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- 로그인 자격증명(아이디/비밀번호)은 더 이상 Supabase Auth가 아니라
-- 현장관리 대시보드의 Neon Postgres User 테이블을 직접 확인해서 검증한다.
-- 이 테이블은 "그 계정이 이 견적 계산기 관리자 화면에 접근 가능한지, 어떤 등급인지"만 저장한다.
-- login_id 는 현장관리 대시보드의 User.loginId(이메일)와 동일한 값을 쓴다.

create table if not exists public.estimate_admin_roles (
  login_id text primary key,
  name text,
  role text not null check (role in ('super_admin', 'admin', 'staff')),
  created_at timestamptz not null default now()
);

-- 커스텀 세션 쿠키로 자체 인증하므로, 이 테이블은 서버(서비스 롤)에서만 접근한다.
-- anon/authenticated 롤에는 아무 정책도 열어주지 않는다(기본 거부).
alter table public.estimate_admin_roles enable row level security;

-- 16명 실제 계정 등록 (현장관리 대시보드 계정과 동일한 이메일).
-- 박경주 · 김원기 만 수퍼관리자, 나머지는 관리자 등급.
insert into public.estimate_admin_roles (login_id, name, role) values
  ('krijina0331@ajd.co.kr', '박경주', 'super_admin'),
  ('wonki.kim@ajd.co.kr', '김원기', 'super_admin'),
  ('mhsr0410@ajd.co.kr', '최민희', 'admin'),
  ('bylee@ajd.co.kr', '이범용', 'admin'),
  ('naerguere@ajd.co.kr', '이정민', 'admin'),
  ('thdms1224@ajd.co.kr', '김소은', 'admin'),
  ('of.joooo@ajd.co.kr', '이진주', 'admin'),
  ('sophie@ajd.co.kr', '현소영', 'admin'),
  ('yujin2914@ajd.co.kr', '배유진', 'admin'),
  ('ysy2561@ajd.co.kr', '유석영', 'admin'),
  ('ehdrbqwe@ajd.co.kr', '이동규', 'admin'),
  ('ljaewan@ajd.co.kr', '임재완', 'admin'),
  ('ljh6573@ajd.co.kr', '이정훈', 'admin'),
  ('yeonjy@ajd.co.kr', '연주용', 'admin'),
  ('lys227@ajd.co.kr', '이연수', 'admin'),
  ('yeji.b@ajd.co.kr', '백예지', 'admin')
on conflict (login_id) do update set role = excluded.role, name = excluded.name;
