-- One-time teacher approval; approved students may self-enable password-based
-- device sign-in. Passwords NEVER stored in plaintext or sent to teacher.
-- All operations are service-role-only RPCs behind the existing token checks.
create table if not exists public.mba_ob_student_device_passwords (
 student_id uuid primary key references public.mba_ob_students(id) on delete cascade,
 password_hash text not null,
 failed_attempts smallint not null default 0,
 locked_until timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.mba_ob_student_device_passwords enable row level security;
revoke all on public.mba_ob_student_device_passwords from public,anon,authenticated;
grant select,insert,update on public.mba_ob_student_device_passwords to service_role;

create or replace function public.mba_ob_set_device_password(p_student_id uuid,p_password text)
returns boolean language plpgsql security invoker set search_path=public,extensions as $$
begin
 if p_student_id is null or p_password is null or length(p_password)<12 or length(p_password)>128
    or p_password !~ '[[:alpha:]]' or p_password !~ '[0-9]' then
   return false;
 end if;
 if not exists(select 1 from public.mba_ob_students s
    where s.id=p_student_id and s.approval_status='approved' and s.disabled_at is null) then
   return false;
 end if;
 insert into public.mba_ob_student_device_passwords(student_id,password_hash,failed_attempts,locked_until,updated_at)
 values(p_student_id,extensions.crypt(p_password,extensions.gen_salt('bf',11)),0,null,now())
 on conflict (student_id) do update
 set password_hash=excluded.password_hash,failed_attempts=0,locked_until=null,updated_at=now();
 return true;
end $$;
create or replace function public.mba_ob_verify_device_password(p_student_number text,p_password text)
returns uuid language plpgsql security invoker set search_path=public,extensions as $$
declare v_student uuid; v_password public.mba_ob_student_device_passwords%rowtype;
begin
 if p_student_number is null or p_password is null or length(p_student_number)>16
    or length(p_password)>128 then return null; end if;
 select s.id into v_student from public.mba_ob_students s
 where s.student_number=p_student_number and s.approval_status='approved'
   and s.disabled_at is null;
 if v_student is null then return null; end if;
 select * into v_password from public.mba_ob_student_device_passwords
   where student_id=v_student for update;
 if not found then return null; end if;
 if v_password.locked_until is not null and v_password.locked_until>now() then return null; end if;
 if extensions.crypt(p_password,v_password.password_hash)=v_password.password_hash then
   update public.mba_ob_student_device_passwords
      set failed_attempts=0,locked_until=null where student_id=v_student;
   return v_student;
 end if;
 update public.mba_ob_student_device_passwords
   set failed_attempts=case when v_password.failed_attempts>=4 then 0 else v_password.failed_attempts+1 end,
       locked_until=case when v_password.failed_attempts>=4 then now()+interval '15 minutes' else null end
 where student_id=v_student;
 return null;
end $$;
revoke all on function public.mba_ob_set_device_password(uuid,text) from public,anon,authenticated;
revoke all on function public.mba_ob_verify_device_password(text,text) from public,anon,authenticated;
grant execute on function public.mba_ob_set_device_password(uuid,text) to service_role;
grant execute on function public.mba_ob_verify_device_password(text,text) to service_role;
comment on table public.mba_ob_student_device_passwords is 'Self-service reusable, student-owned cross-device login; bcrypt hash and 5-failure 15-minute rate limit; approved enrollment only.';
