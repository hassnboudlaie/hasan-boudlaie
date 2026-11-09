-- Atomic instructor-authorized clean start, invoked only via the authenticated Alborz Edge Function.
-- Clears ONLY Alborz workshop progress and on-arrival registrations, never Finance data or instructor credentials.
create or replace function public.alborz_reset_arrival_workshop()
returns void language plpgsql security invoker set search_path=''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('alborz-national-workshop-registration-v1'));
  delete from public.alborz_team_fields where team_no between 1 and 10;
  delete from public.alborz_national_sessions;
  delete from public.alborz_national_members;
end; $$;
revoke all on function public.alborz_reset_arrival_workshop() from public,anon,authenticated;
grant execute on function public.alborz_reset_arrival_workshop() to service_role;
