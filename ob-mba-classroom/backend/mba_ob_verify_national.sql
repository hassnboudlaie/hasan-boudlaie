create or replace function public.mba_ob_check_teacher_national(p_number text)
returns boolean language sql stable security invoker set search_path=public,extensions as $$
 select exists(select 1 from public.mba_ob_teacher_auth where id=1
  and national_hash is not null
  and national_hash=extensions.crypt(p_number,national_hash));
$$;
revoke all on function public.mba_ob_check_teacher_national(text) from public,anon,authenticated;
grant execute on function public.mba_ob_check_teacher_national(text) to service_role;