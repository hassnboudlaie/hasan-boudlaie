-- Alborz workshop only: serialize and rotate a single instructor's ephemeral session.
-- This preserves the existing unique index alborz_active_teacher_key.
-- Calls are available to service_role only, never to anon or authenticated browser roles.
create or replace function public.alborz_rotate_teacher_session(
  p_digest text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if p_digest is null or p_digest !~ '^[0-9a-f]{64}$'
    or p_expires_at is null or p_expires_at <= now()
    or p_expires_at > now() + interval '12 hours 2 minutes' then
    raise exception 'INVALID_TEACHER_SESSION';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(720261109::bigint);
  update public.alborz_access_keys
     set secret_hash=p_digest,
         expires_at=p_expires_at,
         revoked=false,
         team_no=null,
         member_no=null
   where access_role='teacher' and revoked=false;
  if not found then
    insert into public.alborz_access_keys
      (secret_hash,access_role,team_no,member_no,expires_at,revoked)
    values
      (p_digest,'teacher',null,null,p_expires_at,false);
  end if;
  return true;
end;
$$;
revoke all on function public.alborz_rotate_teacher_session(text,timestamptz) from public;
revoke all on function public.alborz_rotate_teacher_session(text,timestamptz) from anon;
revoke all on function public.alborz_rotate_teacher_session(text,timestamptz) from authenticated;
grant execute on function public.alborz_rotate_teacher_session(text,timestamptz) to service_role;
