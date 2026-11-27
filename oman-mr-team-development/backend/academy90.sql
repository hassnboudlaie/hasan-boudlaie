create table public.oman_lxp_course_days (
  user_id uuid not null references public.oman_lxp_profiles(user_id) on delete cascade,
  day smallint not null check (day between 1 and 90),
  read_at timestamptz,
  task text check (char_length(task) between 10 and 3000),
  quiz_answers smallint[],
  quiz_score smallint check (quiz_score between 0 and 2),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
create table public.oman_lxp_course_clock (
  user_id uuid primary key references public.oman_lxp_profiles(user_id) on delete cascade,
  active_seconds integer not null default 0,
  last_tick timestamptz not null default now()
);
create table public.oman_lxp_course_schedule (
  id boolean primary key default true check (id),
  start_date date not null
);
alter table public.oman_lxp_course_days enable row level security;
alter table public.oman_lxp_course_clock enable row level security;
alter table public.oman_lxp_course_schedule enable row level security;
revoke all on public.oman_lxp_course_days, public.oman_lxp_course_clock, public.oman_lxp_course_schedule from anon, authenticated;
grant select, insert, update on public.oman_lxp_course_days to authenticated;
grant select on public.oman_lxp_course_clock to authenticated;
grant select, insert, update on public.oman_lxp_course_schedule to authenticated;
create policy course_days_read on public.oman_lxp_course_days for select to authenticated
  using (user_id = (select auth.uid()) or (select public.oman_lxp_is_admin()));
create policy course_days_insert on public.oman_lxp_course_days for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy course_days_update on public.oman_lxp_course_days for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy course_clock_read on public.oman_lxp_course_clock for select to authenticated
  using (user_id = (select auth.uid()) or (select public.oman_lxp_is_admin()));
create policy course_schedule_read on public.oman_lxp_course_schedule for select to authenticated using (true);
create policy course_schedule_insert on public.oman_lxp_course_schedule for insert to authenticated
  with check ((select public.oman_lxp_is_admin()));
create policy course_schedule_update on public.oman_lxp_course_schedule for update to authenticated
  using ((select public.oman_lxp_is_admin())) with check ((select public.oman_lxp_is_admin()));
create function public.oman_lxp_course_tick() returns integer
language sql security definer set search_path = '' as $$
  insert into public.oman_lxp_course_clock(user_id)
  values ((select auth.uid()))
  on conflict (user_id) do update set
    active_seconds = oman_lxp_course_clock.active_seconds +
      case when now() - oman_lxp_course_clock.last_tick between interval '12 seconds' and interval '40 seconds'
           then 15 else 0 end,
    last_tick = now()
  where now() - oman_lxp_course_clock.last_tick >= interval '12 seconds'
  returning active_seconds;
$$;
revoke all on function public.oman_lxp_course_tick() from public, anon, authenticated;
grant execute on function public.oman_lxp_course_tick() to authenticated;
