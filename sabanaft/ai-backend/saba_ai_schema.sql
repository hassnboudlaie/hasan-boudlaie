-- Run ONLY in a new, dedicated Supabase project for Saba Naft.
-- The browser has no access to this schema. Only the caller's own quota is reserved.
create schema if not exists saba_private;
revoke all on schema saba_private from public, anon, authenticated;

create table if not exists saba_private.coach_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists coach_requests_user_time_idx
on saba_private.coach_requests(user_id,created_at desc);
alter table saba_private.coach_requests enable row level security;
-- No direct read, insert, update or delete policies by design.

create or replace function public.saba_ai_reserve()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_hour integer;
  v_day integer;
begin
  if v_user is null then return false; end if;
  -- Prevent two parallel requests from bypassing the per-user quota.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text, 78241));
  select count(*) into v_hour
  from saba_private.coach_requests
  where user_id=v_user and created_at>pg_catalog.now()-interval '1 hour';
  if v_hour >= 12 then return false; end if;
  select count(*) into v_day
  from saba_private.coach_requests
  where user_id=v_user and created_at>pg_catalog.now()-interval '1 day';
  if v_day >= 50 then return false; end if;
  insert into saba_private.coach_requests(user_id) values(v_user);
  return true;
end;
$$;
revoke all on function public.saba_ai_reserve() from public, anon;
grant execute on function public.saba_ai_reserve() to authenticated;
comment on function public.saba_ai_reserve() is
  'Atomic Saba Leadership AI quota reservation; no text, drafts or prompts stored.';
