-- Saba Naft dedicated project only. DO NOT apply to My Finance or another shared project.
-- RLS protected quota. API users can call only the RPC; row data is not publicly readable.
create table if not exists public.leadership_ai_quota (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  calls integer not null default 0 check (calls between 0 and 12),
  primary key (user_id, window_start)
);
alter table public.leadership_ai_quota enable row level security;
revoke all on public.leadership_ai_quota from anon, authenticated;
-- SECURITY DEFINER is needed only for atomic quota updates, not for accessing private cases.
-- auth.uid() binds all usage to the authenticated JWT; caller never supplies user_id.
create or replace function public.take_leadership_ai_quota(max_count integer default 12)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_window timestamptz := date_trunc('hour', transaction_timestamp());
  v_limit integer := least(greatest(coalesce(max_count, 12), 1), 12);
  v_count integer;
begin
  if v_user is null then
    return false;
  end if;
  insert into public.leadership_ai_quota (user_id, window_start, calls)
  values (v_user, v_window, 1)
  on conflict (user_id, window_start)
  do update set calls = public.leadership_ai_quota.calls + 1
  where public.leadership_ai_quota.calls < v_limit
  returning calls into v_count;
  return v_count is not null;
end;
$$;
revoke all on function public.take_leadership_ai_quota(integer) from PUBLIC, anon;
grant execute on function public.take_leadership_ai_quota(integer) to authenticated;
-- Prune quota records older than the documented retention window via approved server scheduler.
-- This migration does not create auth users or expose personal cases.
