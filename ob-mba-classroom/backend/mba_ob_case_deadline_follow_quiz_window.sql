create or replace function public.mba_ob_session_one_case_deadline()
returns trigger language plpgsql set search_path to 'public' as $$
begin
 if new.session_no=1 and (TG_OP='INSERT' or new.revision_no is distinct from old.revision_no)
    and clock_timestamp() >= coalesce((select closes_at from public.mba_ob_quiz_windows where session_no=1),timestamptz '2026-11-28 00:00:00+03:30') then
   raise exception 'case_deadline_passed' using errcode='P0001';
 end if;
 return new;
end; $$;
