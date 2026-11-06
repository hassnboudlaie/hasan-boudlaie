-- Isolated Alborz-only schema hardening. Never modifies Finance or Auth.
alter table public.alborz_access_keys add column if not exists member_no smallint check (member_no between 1 and 5);
alter table public.alborz_access_keys add column if not exists expires_at timestamptz not null default (now() + interval '1 day');
alter table public.alborz_access_keys add column if not exists revoked boolean not null default false;
alter table public.alborz_team_fields add column if not exists version integer not null default 1;
create table if not exists public.alborz_api_limits(bucket text primary key, window_start timestamptz not null, hits integer not null);
alter table public.alborz_api_limits enable row level security;
revoke all on public.alborz_api_limits,public.alborz_access_keys,public.alborz_team_fields from public,anon,authenticated;
grant select,insert,update,delete on public.alborz_api_limits,public.alborz_access_keys,public.alborz_team_fields to service_role;
create or replace function public.alborz_rate_limit(p_bucket text,p_limit integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.alborz_api_limits(bucket,window_start,hits) values(p_bucket,now(),1)
 on conflict(bucket) do update set hits=case when alborz_api_limits.window_start < now()-interval '1 minute' then 1 else alborz_api_limits.hits+1 end,
 window_start=case when alborz_api_limits.window_start < now()-interval '1 minute' then now() else alborz_api_limits.window_start end returning hits into n;
 return n <= p_limit;
end; $$;
revoke all on function public.alborz_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.alborz_rate_limit(text,integer) to service_role;
create or replace function public.alborz_write_fields(p_team integer,p_fields jsonb,p_expected jsonb,p_editor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare k text; v jsonb; existing integer; conflicts jsonb := '[]'; results jsonb;
begin
 if p_team not between 1 and 10 or jsonb_typeof(p_fields) <> 'object' or jsonb_typeof(p_expected)<>'object' then raise exception 'invalid payload'; end if;
 perform pg_advisory_xact_lock(681106,p_team);
 for k,v in select * from jsonb_each(p_fields) loop
  select version into existing from public.alborz_team_fields where team_no=p_team and field_key=k;
  if not (p_expected ? k) or (p_expected->>k)::integer <> coalesce(existing,0) then conflicts=conflicts||jsonb_build_array(k); end if;
 end loop;
 if jsonb_array_length(conflicts)>0 then return jsonb_build_object('ok',false,'conflicts',conflicts); end if;
 for k,v in select * from jsonb_each(p_fields) loop
  insert into public.alborz_team_fields(team_no,field_key,field_value,editor_label,updated_at,version)
  values(p_team,k,v,p_editor,clock_timestamp(),1)
  on conflict(team_no,field_key) do update set field_value=excluded.field_value,editor_label=excluded.editor_label,updated_at=excluded.updated_at,version=alborz_team_fields.version+1;
 end loop;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into results from public.alborz_team_fields t where team_no=p_team and p_fields ? field_key;
 return jsonb_build_object('ok',true,'records',results);
end; $$;
revoke all on function public.alborz_write_fields(integer,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.alborz_write_fields(integer,jsonb,jsonb,text) to service_role;
-- Replace pilot's one-code-per-team indexes with per-member active keys.
drop index if exists public.alborz_one_access_key_per_team;
drop index if exists public.alborz_one_teacher_access_key;
create unique index if not exists alborz_active_member_key on public.alborz_access_keys(team_no,member_no) where access_role='team' and not revoked;
create unique index if not exists alborz_active_teacher_key on public.alborz_access_keys(access_role) where access_role='teacher' and not revoked;
