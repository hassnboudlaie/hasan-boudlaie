-- MBA OB registration and privilege gating v2. Does not touch unrelated tables.
-- Service role only. Browser-accessible tables remain deny-all under RLS.
alter table public.mba_ob_students alter column invitation_id drop not null;
alter table public.mba_ob_students add column if not exists student_number text;
alter table public.mba_ob_students add column if not exists approval_status text not null default 'approved';
alter table public.mba_ob_students add column if not exists reviewed_at timestamptz;
create unique index if not exists mba_ob_student_number_unique on public.mba_ob_students(student_number)
  where student_number is not null;
alter table public.mba_ob_students add constraint mba_ob_student_number_digits
  check (student_number is null or student_number ~ '^[0-9]{6,16}$');
alter table public.mba_ob_students add constraint mba_ob_approval_status_valid
  check (approval_status in ('pending','approved','rejected'));
alter table public.mba_ob_teacher_auth add column if not exists national_hash text;
create table if not exists public.mba_ob_teacher_devices (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null unique,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '365 days'),
 revoked_at timestamptz,
 attempt_count integer not null default 0,
 blocked_until timestamptz
);
alter table public.mba_ob_teacher_devices enable row level security;
revoke all on public.mba_ob_teacher_devices from public,anon,authenticated;
grant select,insert,update,delete on public.mba_ob_teacher_devices to service_role;

-- Atomic one-time student registration; storing the approved identity only once.
create or replace function public.mba_ob_register_by_student_number(
 p_student_number text,p_name text,p_session_hash text
) returns jsonb language plpgsql security invoker set search_path=public
as $$
declare v_student uuid;
begin
 if p_student_number !~ '^[0-9]{6,16}$'
  or char_length(trim(p_name)) not between 3 and 90
  or length(p_session_hash) <> 64 then
   return jsonb_build_object('ok',false,'error','invalid_registration');
 end if;
 insert into public.mba_ob_students(student_number,full_name,approval_status)
  values(p_student_number,trim(p_name),'pending')
  on conflict do nothing returning id into v_student;
 if v_student is null then
   return jsonb_build_object('ok',false,'error','already_registered');
 end if;
 insert into public.mba_ob_sessions(role,student_id,token_hash,expires_at)
  values('student',v_student,p_session_hash,clock_timestamp()+interval '365 days');
 return jsonb_build_object('ok',true,'student_id',v_student,'approval_status','pending');
end;
$$;
revoke all on function public.mba_ob_register_by_student_number(text,text,text)
  from public,anon,authenticated;
grant execute on function public.mba_ob_register_by_student_number(text,text,text) to service_role;

-- Teacher identity is stored as bcrypt hash. Never accept plain national id by itself.
create or replace function public.mba_ob_set_teacher_national(p_number text)
returns boolean language plpgsql security invoker set search_path=public,extensions as $$
begin
 if p_number !~ '^[0-9]{10}$' then return false; end if;
 update public.mba_ob_teacher_auth
  set national_hash=extensions.crypt(p_number,extensions.gen_salt('bf',12))
  where id=1;
 return found;
end;
$$;
revoke all on function public.mba_ob_set_teacher_national(text) from public,anon,authenticated;
grant execute on function public.mba_ob_set_teacher_national(text) to service_role;

-- Rate-limited trusted-device + national identifier verification.
create or replace function public.mba_ob_check_teacher_device(p_number text,p_token_hash text)
returns boolean language plpgsql security invoker set search_path=public,extensions
as $$
declare v_device public.mba_ob_teacher_devices%rowtype; v_ok boolean;
begin
 if p_number !~ '^[0-9]{10}$' or length(p_token_hash)<>64 then return false; end if;
 select * into v_device from public.mba_ob_teacher_devices
  where token_hash=p_token_hash and revoked_at is null and expires_at>clock_timestamp()
  for update;
 if not found then return false; end if;
 if v_device.blocked_until is not null and v_device.blocked_until>clock_timestamp()
  then return false; end if;
 select exists(select 1 from public.mba_ob_teacher_auth
  where id=1 and national_hash is not null
   and national_hash=extensions.crypt(p_number,national_hash)) into v_ok;
 if v_ok then
  update public.mba_ob_teacher_devices
   set attempt_count=0,blocked_until=null where id=v_device.id;
  return true;
 end if;
 update public.mba_ob_teacher_devices
   set attempt_count=case when attempt_count>=5 then 0 else attempt_count+1 end,
       blocked_until=case when attempt_count>=5 then clock_timestamp()+interval '15 minutes'
         else blocked_until end
  where id=v_device.id;
 return false;
end;
$$;
revoke all on function public.mba_ob_check_teacher_device(text,text) from public,anon,authenticated;
grant execute on function public.mba_ob_check_teacher_device(text,text) to service_role;

-- Attendance remains unavailable until instructor approval.
create or replace function public.mba_ob_claim_attendance(
 p_student_id uuid,p_session_no integer,p_code_hash text
)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_window public.mba_ob_windows%rowtype;v_existing text;v_tries integer;
begin
 if p_session_no not between 1 and 16 then return jsonb_build_object('ok',false,'error','invalid_session');end if;
 if not exists(select 1 from public.mba_ob_students
  where id=p_student_id and disabled_at is null and approval_status='approved') then
   return jsonb_build_object('ok',false,'error','approval_required');
 end if;
 select status into v_existing from public.mba_ob_attendance
  where student_id=p_student_id and session_no=p_session_no;
 if found then return jsonb_build_object('ok',true,'status',v_existing,'already',true);end if;
 select * into v_window from public.mba_ob_windows where session_no=p_session_no;
 if not found or v_window.closed_at is not null or clock_timestamp()<v_window.opened_at
  or clock_timestamp()>=v_window.closes_at then
   return jsonb_build_object('ok',false,'error','window_closed');
 end if;
 insert into public.mba_ob_failed_codes(student_id,session_no,attempt_count)
  values(p_student_id,p_session_no,0) on conflict do nothing;
 select attempt_count into v_tries from public.mba_ob_failed_codes
  where student_id=p_student_id and session_no=p_session_no for update;
 if v_tries>=8 then return jsonb_build_object('ok',false,'error','too_many_attempts');end if;
 if v_window.code_hash<>p_code_hash then
  update public.mba_ob_failed_codes set attempt_count=attempt_count+1,last_attempt_at=clock_timestamp()
  where student_id=p_student_id and session_no=p_session_no;
  return jsonb_build_object('ok',false,'error','wrong_code');
 end if;
 insert into public.mba_ob_attendance(student_id,session_no,checked_at,status)
 values(p_student_id,p_session_no,clock_timestamp(),'pending') on conflict do nothing;
 return jsonb_build_object('ok',true,'status','pending','already',false);
end;
$$;
revoke all on function public.mba_ob_claim_attendance(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.mba_ob_claim_attendance(uuid,integer,text) to service_role;