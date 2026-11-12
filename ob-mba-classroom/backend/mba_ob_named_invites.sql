alter table public.mba_ob_invitations
  add column if not exists expected_name text;
alter table public.mba_ob_invitations
  add constraint mba_ob_expected_name_length
  check (expected_name is null or char_length(expected_name) between 3 and 90);
create or replace function public.mba_ob_redeem_invitation(
 p_invite_hash text,p_name text,p_session_hash text
) returns jsonb language plpgsql security invoker set search_path=public
as $$
declare v_invite uuid; v_student uuid; v_name text;
begin
 if length(p_invite_hash)<>64 or length(p_session_hash)<>64 then
  return jsonb_build_object('ok',false,'error','invalid_invitation');
 end if;
 select id,coalesce(expected_name,nullif(trim(p_name),'')) into v_invite,v_name
 from public.mba_ob_invitations
 where token_hash=p_invite_hash and redeemed_at is null and revoked_at is null
 for update;
 if not found then return jsonb_build_object('ok',false,'error','invite_unavailable'); end if;
 if char_length(v_name) not between 3 and 90 then
  return jsonb_build_object('ok',false,'error','invalid_name');
 end if;
 insert into public.mba_ob_students(invitation_id,full_name)
 values(v_invite,v_name) returning id into v_student;
 update public.mba_ob_invitations set redeemed_at=clock_timestamp() where id=v_invite;
 insert into public.mba_ob_sessions(role,student_id,token_hash,expires_at)
 values('student',v_student,p_session_hash,clock_timestamp()+interval '365 days');
 return jsonb_build_object('ok',true,'student_id',v_student,'name',v_name);
end;
$$;
revoke all on function public.mba_ob_redeem_invitation(text,text,text)
  from public,anon,authenticated;
grant execute on function public.mba_ob_redeem_invitation(text,text,text)
  to service_role;