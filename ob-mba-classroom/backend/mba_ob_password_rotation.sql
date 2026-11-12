-- Service-only teacher password rotation called through the protected Edge API.
create or replace function public.mba_ob_set_teacher_password(p_new text)
returns boolean language plpgsql security invoker set search_path=public,extensions
as $$
begin
 if char_length(p_new)<16 or char_length(p_new)>100 then return false; end if;
 update public.mba_ob_teacher_auth
 set secret_hash=extensions.crypt(p_new,extensions.gen_salt('bf',12))
 where id=1;
 return found;
end;
$$;
revoke all on function public.mba_ob_set_teacher_password(text)
from public,anon,authenticated;
grant execute on function public.mba_ob_set_teacher_password(text)
to service_role;