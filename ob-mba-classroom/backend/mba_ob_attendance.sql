-- MBA OB independent attendance subsystem. Does not alter finance or other applications.
-- Public API is denied direct table access; a named Edge Function validates opaque tokens.
create table if not exists public.mba_ob_teacher_auth (
  id integer primary key default 1 check (id=1),
  secret_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.mba_ob_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  revoked_at timestamptz
);
create table if not exists public.mba_ob_students (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.mba_ob_invitations(id),
  full_name text not null check (char_length(full_name) between 3 and 90),
  enrolled_at timestamptz not null default now(),
  disabled_at timestamptz
);
create table if not exists public.mba_ob_sessions (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student','teacher')),
  student_id uuid references public.mba_ob_students(id),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check ((role='teacher' and student_id is null) or (role='student' and student_id is not null))
);
create table if not exists public.mba_ob_windows (
  session_no integer primary key check (session_no between 1 and 16),
  code_hash text not null,
  opened_at timestamptz not null,
  closes_at timestamptz not null,
  closed_at timestamptz,
  check (closes_at > opened_at)
);
create table if not exists public.mba_ob_attendance (
  student_id uuid not null references public.mba_ob_students(id),
  session_no integer not null check (session_no between 1 and 16),
  checked_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  primary key (student_id,session_no)
);
create table if not exists public.mba_ob_failed_codes (
  student_id uuid not null references public.mba_ob_students(id),
  session_no integer not null check (session_no between 1 and 16),
  attempt_count integer not null default 0,
  last_attempt_at timestamptz not null default now(),
  primary key (student_id,session_no)
);
create index if not exists mba_ob_sessions_active_idx on public.mba_ob_sessions(token_hash) where revoked_at is null;
create index if not exists mba_ob_attendance_by_session_idx on public.mba_ob_attendance(session_no,status);
create index if not exists mba_ob_students_name_idx on public.mba_ob_students(full_name);

alter table public.mba_ob_teacher_auth enable row level security;
alter table public.mba_ob_invitations enable row level security;
alter table public.mba_ob_students enable row level security;
alter table public.mba_ob_sessions enable row level security;
alter table public.mba_ob_windows enable row level security;
alter table public.mba_ob_attendance enable row level security;
alter table public.mba_ob_failed_codes enable row level security;

revoke all on public.mba_ob_teacher_auth,public.mba_ob_invitations,
  public.mba_ob_students,public.mba_ob_sessions,public.mba_ob_windows,
  public.mba_ob_attendance,public.mba_ob_failed_codes from public,anon,authenticated;
grant select,insert,update,delete on public.mba_ob_teacher_auth,public.mba_ob_invitations,
  public.mba_ob_students,public.mba_ob_sessions,public.mba_ob_windows,
  public.mba_ob_attendance,public.mba_ob_failed_codes to service_role;

-- Service-only password verification. Teacher password is inserted separately,
-- never committed to the public repository.
create or replace function public.mba_ob_check_teacher(p_password text)
returns boolean
language sql stable security invoker set search_path=public,extensions
as $$
  select exists(
    select 1 from public.mba_ob_teacher_auth
    where id=1 and secret_hash=extensions.crypt(p_password,secret_hash)
  );
$$;
revoke all on function public.mba_ob_check_teacher(text) from public,anon,authenticated;
grant execute on function public.mba_ob_check_teacher(text) to service_role;

-- Atomic server-clock check: browser time and UI flags are never authoritative.
create or replace function public.mba_ob_claim_attendance(
  p_student_id uuid,p_session_no integer,p_code_hash text
)
returns jsonb language plpgsql security invoker set search_path=public
as $$
declare
  v_window public.mba_ob_windows%rowtype;
  v_existing text;
  v_tries integer;
begin
  if p_session_no not between 1 and 16 then
    return jsonb_build_object('ok',false,'error','invalid_session');
  end if;
  if not exists(select 1 from public.mba_ob_students
                where id=p_student_id and disabled_at is null) then
    return jsonb_build_object('ok',false,'error','student_disabled');
  end if;
  select status into v_existing from public.mba_ob_attendance
    where student_id=p_student_id and session_no=p_session_no;
  if found then
    return jsonb_build_object('ok',true,'status',v_existing,'already',true);
  end if;
  select * into v_window from public.mba_ob_windows
    where session_no=p_session_no;
  if not found or v_window.closed_at is not null
     or clock_timestamp()<v_window.opened_at
     or clock_timestamp()>=v_window.closes_at then
    return jsonb_build_object('ok',false,'error','window_closed');
  end if;
  insert into public.mba_ob_failed_codes(student_id,session_no,attempt_count)
    values(p_student_id,p_session_no,0)
    on conflict do nothing;
  select attempt_count into v_tries from public.mba_ob_failed_codes
    where student_id=p_student_id and session_no=p_session_no for update;
  if v_tries>=8 then
    return jsonb_build_object('ok',false,'error','too_many_attempts');
  end if;
  if v_window.code_hash<>p_code_hash then
    update public.mba_ob_failed_codes set attempt_count=attempt_count+1,
      last_attempt_at=clock_timestamp()
      where student_id=p_student_id and session_no=p_session_no;
    return jsonb_build_object('ok',false,'error','wrong_code');
  end if;
  insert into public.mba_ob_attendance(student_id,session_no,checked_at,status)
    values(p_student_id,p_session_no,clock_timestamp(),'pending')
    on conflict do nothing;
  return jsonb_build_object('ok',true,'status','pending',
                             'already',false);
end;
$$;
revoke all on function public.mba_ob_claim_attendance(uuid,integer,text)
from public,anon,authenticated;
grant execute on function public.mba_ob_claim_attendance(uuid,integer,text)
to service_role;