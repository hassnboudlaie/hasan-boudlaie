-- Allameh MBA OB: new student enrollment sets the reusable cross-device credential.
-- First instructor approval is still mandatory and recorded on mba_ob_students.
-- Every subsequent device uses student_number + self-selected password, never a new approval.
-- Reuses RLS-protected mba_ob_students, mba_ob_sessions and mba_ob_student_device_passwords.
-- Service-role RPC only; no authorization data is exposed to GitHub Pages.
create or replace function public.mba_ob_register_with_password(
 p_student_number text, p_name text, p_session_hash text, p_password text
) returns jsonb language plpgsql security invoker set search_path=public,extensions
as $$
declare v_student uuid;
begin
 if coalesce(p_student_number,'') !~ '^[0-9]{6,16}$'
    or char_length(trim(coalesce(p_name,''))) not between 3 and 90
    or coalesce(p_session_hash,'') !~ '^[0-9a-f]{64}$'
    or char_length(coalesce(p_password,'')) not between 12 and 64
    or octet_length(coalesce(p_password,'')) > 72
    or coalesce(p_password,'') !~ '[[:alpha:]]'
    or coalesce(p_password,'') !~ '[0-9]' then
   return jsonb_build_object('ok',false,'error','invalid_registration');
 end if;
 insert into public.mba_ob_students(student_number,full_name,approval_status)
 values(p_student_number,trim(p_name),'pending')
 on conflict do nothing returning id into v_student;
 if v_student is null then
   return jsonb_build_object('ok',false,'error','already_registered');
 end if;
 -- Password exists while approval is pending, but verification RPC denies login
 -- until the instructor approves this student_id.
 insert into public.mba_ob_student_device_passwords(student_id,password_hash)
 values(v_student,extensions.crypt(p_password,extensions.gen_salt('bf',11)));
 insert into public.mba_ob_sessions(role,student_id,token_hash,expires_at)
 values('student',v_student,p_session_hash,clock_timestamp()+interval '365 days');
 return jsonb_build_object('ok',true,'student_id',v_student,'approval_status','pending');
end;
$$;
revoke all on function public.mba_ob_register_with_password(text,text,text,text)
 from public,anon,authenticated;
grant execute on function public.mba_ob_register_with_password(text,text,text,text)
 to service_role;
comment on function public.mba_ob_register_with_password(text,text,text,text) is
 'Atomic new student enrollment: a single teacher approval per student number, with bcrypt-hashed cross-device password (unusable until approved).';
