-- Service-only short-code authentication. No credentials in this migration.
create table public.alborz_pin_keys (
 digest text primary key, team_no smallint not null check(team_no between 1 and 10),
 member_no smallint not null check(member_no between 1 and 5), expires_at timestamptz not null,
 revoked boolean not null default false, unique(team_no,member_no)
);
create table public.alborz_pin_sessions (
 digest text primary key, pin_digest text not null references public.alborz_pin_keys(digest), expires_at timestamptz not null
);
create table public.alborz_login_limits(bucket text primary key,window_start timestamptz not null,hits integer not null);
alter table public.alborz_pin_keys enable row level security;
alter table public.alborz_pin_sessions enable row level security;
alter table public.alborz_login_limits enable row level security;
revoke all on public.alborz_pin_keys,public.alborz_pin_sessions,public.alborz_login_limits from public,anon,authenticated;
grant all on public.alborz_pin_keys,public.alborz_pin_sessions,public.alborz_login_limits to service_role;
create function public.alborz_login_gate(p_bucket text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.alborz_login_limits values(p_bucket,clock_timestamp(),1)
 on conflict(bucket) do update set hits=case when alborz_login_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else alborz_login_limits.hits+1 end,
 window_start=case when alborz_login_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else alborz_login_limits.window_start end returning hits into n;
 return n<=p_limit;
end;$$;
revoke all on function public.alborz_login_gate(text,integer,integer) from public,anon,authenticated;
grant execute on function public.alborz_login_gate(text,integer,integer) to service_role;
