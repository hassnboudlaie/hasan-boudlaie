create table public.mba_ob_student_recovery_links (
 student_id uuid primary key references public.mba_ob_students(id) on delete cascade,
 token_hash text not null unique,
 expires_at timestamptz not null
);
alter table public.mba_ob_student_recovery_links enable row level security;
revoke all on public.mba_ob_student_recovery_links from public, anon, authenticated;
grant select, insert, update, delete on public.mba_ob_student_recovery_links to service_role;

create function public.mba_ob_redeem_student_recovery(p_token_hash text,p_password text)
returns uuid language plpgsql set search_path to 'public' as $$
declare v_student uuid;
begin
 if p_password is null or length(p_password)<12 or octet_length(p_password)>72
    or p_password !~ '[[:alpha:]]' or p_password !~ '[0-9]' then return null; end if;
 delete from public.mba_ob_student_recovery_links
 where token_hash=p_token_hash and expires_at>clock_timestamp()
 returning student_id into v_student;
 if v_student is null then return null; end if;
 if not public.mba_ob_set_device_password(v_student,p_password) then return null; end if;
 update public.mba_ob_sessions set revoked_at=clock_timestamp()
 where student_id=v_student and role='student' and revoked_at is null;
 return v_student;
end; $$;
revoke all on function public.mba_ob_redeem_student_recovery(text,text) from public, anon, authenticated;
grant execute on function public.mba_ob_redeem_student_recovery(text,text) to service_role;
