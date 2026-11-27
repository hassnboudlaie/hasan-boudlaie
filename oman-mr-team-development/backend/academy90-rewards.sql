create table public.oman_lxp_course_rewards (
  user_id uuid not null references public.oman_lxp_profiles(user_id) on delete cascade,
  week smallint not null check (week between 1 and 13),
  points smallint not null check (points between 0 and 100),
  rate_irr integer not null check (rate_irr between 1 and 100000000),
  amount_irr bigint generated always as (points::bigint * rate_irr) stored,
  approved_at timestamptz not null default now(),
  approved_by uuid not null,
  issued_at timestamptz,
  primary key (user_id, week)
);
alter table public.oman_lxp_course_rewards enable row level security;
revoke all on public.oman_lxp_course_rewards from anon, authenticated;
grant select on public.oman_lxp_course_rewards to authenticated;
create policy course_rewards_read on public.oman_lxp_course_rewards for select to authenticated
  using (user_id = (select auth.uid()) or (select public.oman_lxp_is_admin()));

create function public.oman_lxp_approve_reward(p_user uuid, p_week integer, p_rate integer)
returns public.oman_lxp_course_rewards
language plpgsql security definer set search_path = '' as $$
declare
  v_end integer;
  v_start date;
  v_points integer;
  v_reward public.oman_lxp_course_rewards;
begin
  if not public.oman_lxp_is_admin() then raise exception 'Admin required'; end if;
  if p_week is null or p_week not between 1 and 13 or p_rate is null or p_rate not between 1 and 100000000 then
    raise exception 'Invalid week or rate';
  end if;
  select * into v_reward from public.oman_lxp_course_rewards where user_id=p_user and week=p_week;
  if found then return v_reward; end if;
  v_end := least(90,p_week*7);
  select start_date into v_start from public.oman_lxp_course_schedule where id;
  if v_start is null or (now() at time zone 'Asia/Muscat')::date < v_start + v_end then
    raise exception 'Week must have ended';
  end if;
  select coalesce(sum(
    case when read_at is not null then 2 else 0 end +
    case when task is not null then (case when day=v_end then 8 else 5 end) else 0 end +
    case when day=v_end then coalesce(quiz_score,0)*3 else 0 end
  ),0) into v_points
  from public.oman_lxp_course_days where user_id=p_user and day between (p_week-1)*7+1 and v_end;
  if v_points=0 then raise exception 'No points to approve'; end if;
  insert into public.oman_lxp_course_rewards(user_id,week,points,rate_irr,approved_by)
    values(p_user,p_week,v_points,p_rate,auth.uid()) on conflict (user_id,week) do nothing;
  select * into v_reward from public.oman_lxp_course_rewards where user_id=p_user and week=p_week;
  return v_reward;
end;
$$;

create function public.oman_lxp_issue_reward(p_user uuid,p_week integer)
returns public.oman_lxp_course_rewards
language plpgsql security definer set search_path = '' as $$
declare v_reward public.oman_lxp_course_rewards;
begin
  if not public.oman_lxp_is_admin() then raise exception 'Admin required'; end if;
  update public.oman_lxp_course_rewards set issued_at=coalesce(issued_at,now())
    where user_id=p_user and week=p_week returning * into v_reward;
  if not found then raise exception 'Reward not approved'; end if;
  return v_reward;
end;
$$;
revoke all on function public.oman_lxp_approve_reward(uuid,integer,integer),public.oman_lxp_issue_reward(uuid,integer) from public, anon, authenticated;
grant execute on function public.oman_lxp_approve_reward(uuid,integer,integer),public.oman_lxp_issue_reward(uuid,integer) to authenticated;

create function public.oman_lxp_grade_course_quiz() returns trigger language plpgsql set search_path='' as $$
declare
  v_keys constant smallint[][] := array[[1,0],[2,0],[1,2],[0,2],[1,2],[2,0],[0,1],[1,0],[2,0],[1,2],[0,1],[2,0],[0,1]];
  v_week integer := (new.day-1)/7+1;
begin
  if new.quiz_answers is null then new.quiz_score:=null; return new; end if;
  if new.day <> least(90,v_week*7) or array_ndims(new.quiz_answers)<>1 or array_lower(new.quiz_answers,1)<>1
    or cardinality(new.quiz_answers)<>2 or exists(select 1 from unnest(new.quiz_answers) a where a is null or a not between 0 and 2) then
    raise exception 'Invalid weekly quiz submission';
  end if;
  new.quiz_score := (new.quiz_answers[1]=v_keys[v_week][1])::integer + (new.quiz_answers[2]=v_keys[v_week][2])::integer;
  return new;
end;
$$;
revoke all on function public.oman_lxp_grade_course_quiz() from public, anon, authenticated;
create trigger oman_lxp_grade_course_quiz before insert or update of quiz_answers, quiz_score on public.oman_lxp_course_days
for each row execute function public.oman_lxp_grade_course_quiz();
