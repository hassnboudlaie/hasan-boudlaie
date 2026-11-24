-- Sessions 1 and 2 use explicit class deadlines. Later sessions retain 24-hour windows.
alter table public.mba_ob_quiz_windows drop constraint if exists exactly_24h;
alter table public.mba_ob_quiz_windows
  add constraint mba_ob_quiz_window_duration
  check (closes_at > opens_at and (session_no in (1, 2) or closes_at = opens_at + interval '24 hours'));

create table public.mba_ob_quiz_entries (
  student_id uuid not null references public.mba_ob_students(id) on delete cascade,
  session_no smallint not null references public.mba_ob_quiz_windows(session_no) check (session_no in (1, 2)),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  started_at timestamptz not null default statement_timestamp(),
  primary key (student_id, session_no)
);
alter table public.mba_ob_quiz_entries enable row level security;
revoke all on public.mba_ob_quiz_entries from public, anon, authenticated;
grant select, insert on public.mba_ob_quiz_entries to service_role;

create function public.mba_ob_quiz_check_entry_window()
returns trigger language plpgsql set search_path=public as $$
declare window_row public.mba_ob_quiz_windows%rowtype;
begin
  select * into window_row from public.mba_ob_quiz_windows where session_no=new.session_no for share;
  if not found or statement_timestamp()<window_row.opens_at or statement_timestamp()>=window_row.closes_at then
    raise exception 'quiz_closed' using errcode='P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.mba_ob_quiz_check_entry_window() from public, anon, authenticated;
create trigger mba_ob_quiz_entry_window before insert on public.mba_ob_quiz_entries
for each row execute function public.mba_ob_quiz_check_entry_window();
