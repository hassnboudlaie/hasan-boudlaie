-- Alborz resilience workshop only: first-arrival self-registration by Iranian national code.
-- Raw national codes must never be stored in GitHub, Postgres or browser storage.
-- Edge Function sends an HMAC digest, and random sessions are stored as SHA-256 digests.
create table if not exists public.alborz_national_members (
  national_digest text primary key check (national_digest ~ '^[0-9a-f]{64}$'),
  team_no smallint not null check (team_no between 1 and 10),
  member_no smallint not null check (member_no between 1 and 5),
  registered_at timestamptz not null default now(),
  unique (team_no, member_no)
);
create table if not exists public.alborz_national_sessions (
  digest text primary key check (digest ~ '^[0-9a-f]{64}$'),
  national_digest text not null references public.alborz_national_members(national_digest),
  expires_at timestamptz not null
);
create index if not exists alborz_national_sessions_expiry_idx on public.alborz_national_sessions(expires_at);
alter table public.alborz_national_members enable row level security;
alter table public.alborz_national_sessions enable row level security;
revoke all on public.alborz_national_members,public.alborz_national_sessions from public,anon,authenticated;
grant all on public.alborz_national_members,public.alborz_national_sessions to service_role;

-- Serialized allocation avoids duplicate seats when 50 participants arrive simultaneously.
-- Existing national_digest always returns its originally assigned team and seat.
create or replace function public.alborz_enroll_national(p_digest text)
returns table(team_no smallint, member_no smallint)
language plpgsql security invoker set search_path=''
as $$
declare
  v_team smallint;
  v_member smallint;
begin
  if p_digest is null or p_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_NATIONAL_DIGEST' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('alborz-national-workshop-registration-v1'));
  select n.team_no,n.member_no into v_team,v_member
    from public.alborz_national_members n where n.national_digest=p_digest;
  if not found then
    select ((s.seat-1)/5+1)::smallint,((s.seat-1)%5+1)::smallint
      into v_team,v_member
      from pg_catalog.generate_series(1,50) as s(seat)
      where not exists (
        select 1 from public.alborz_national_members n
        where n.team_no=((s.seat-1)/5+1)::smallint
          and n.member_no=((s.seat-1)%5+1)::smallint
      )
      order by s.seat limit 1;
    if not found then
      raise exception 'CAPACITY_REACHED' using errcode='P0001';
    end if;
    insert into public.alborz_national_members(national_digest,team_no,member_no)
      values(p_digest,v_team,v_member);
  end if;
  team_no:=v_team; member_no:=v_member;
  return next;
end; $$;
revoke all on function public.alborz_enroll_national(text) from public,anon,authenticated;
grant execute on function public.alborz_enroll_national(text) to service_role;
