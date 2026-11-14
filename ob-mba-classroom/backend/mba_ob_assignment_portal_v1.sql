-- MBA Organizational Behavior: private assignment submissions + file metadata.
-- Dedicated tables/storage; existing case reviews and finance data are untouched.
create table if not exists public.mba_ob_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.mba_ob_students(id),
  session_no smallint not null check (session_no between 1 and 16),
  kind text not null check (kind in ('case','homework')),
  answer_text text not null default '' check (char_length(answer_text)<=12000),
  file_items jsonb not null default '[]'::jsonb check (jsonb_typeof(file_items)='array' and jsonb_array_length(file_items)<=3 and octet_length(file_items::text)<=6000),
  status text not null default 'submitted' check(status in ('submitted','reviewed','revision_requested')),
  score numeric(4,1) check(score between 0 and 20),
  feedback text check(feedback is null or char_length(feedback)<=3000),
  revision_no integer not null default 1 check(revision_no between 1 and 100),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique(student_id,session_no,kind),
  check(char_length(btrim(answer_text))>=8 or jsonb_array_length(file_items)>0)
);
create index if not exists mba_ob_assignments_review_idx on public.mba_ob_assignments(session_no,status,submitted_at desc);
alter table public.mba_ob_assignments enable row level security;
revoke all on public.mba_ob_assignments from public,anon,authenticated;
grant select,insert,update on public.mba_ob_assignments to service_role;

create table if not exists public.mba_ob_assignment_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.mba_ob_assignments(id) on delete cascade,
  revision_no integer not null,
  decision text not null check(decision in ('reviewed','revision_requested')),
  score numeric(4,1) check(score between 0 and 20),
  feedback text not null check(char_length(btrim(feedback)) between 8 and 3000),
  reviewed_at timestamptz not null default now()
);
create index if not exists mba_ob_assignment_reviews_sub_idx on public.mba_ob_assignment_reviews(submission_id,reviewed_at desc);
alter table public.mba_ob_assignment_reviews enable row level security;
revoke all on public.mba_ob_assignment_reviews from public,anon,authenticated;
grant select,insert,update on public.mba_ob_assignment_reviews to service_role;

-- Reject overwrites unless the instructor has requested a revision.
create or replace function public.mba_ob_submit_assignment(p_student_id uuid,p_session_no smallint,p_kind text,p_answer_text text,p_file_items jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare row_existing public.mba_ob_assignments%rowtype; v_id uuid; v_revision integer;
begin
 if p_session_no is null or p_session_no not between 1 and 16 or p_kind not in ('case','homework')
   or p_answer_text is null or char_length(p_answer_text)>12000
   or p_file_items is null or jsonb_typeof(p_file_items)<>'array' or jsonb_array_length(p_file_items)>3
   or octet_length(p_file_items::text)>6000
   or (char_length(btrim(p_answer_text))<8 and jsonb_array_length(p_file_items)=0)
 then return jsonb_build_object('ok',false,'error','invalid_assignment'); end if;
 if not exists (select 1 from public.mba_ob_students where id=p_student_id and approval_status='approved' and disabled_at is null)
 then return jsonb_build_object('ok',false,'error','approval_required'); end if;
 select * into row_existing from public.mba_ob_assignments
 where student_id=p_student_id and session_no=p_session_no and kind=p_kind for update;
 if found and row_existing.status<>'revision_requested' then
 return jsonb_build_object('ok',false,'error','assignment_already_submitted'); end if;
 if found then
  update public.mba_ob_assignments set answer_text=p_answer_text,file_items=p_file_items,status='submitted',
   score=null,feedback=null,reviewed_at=null,submitted_at=now(),revision_no=revision_no+1
   where id=row_existing.id returning id,revision_no into v_id,v_revision;
 else
  insert into public.mba_ob_assignments(student_id,session_no,kind,answer_text,file_items)
  values(p_student_id,p_session_no,p_kind,p_answer_text,p_file_items)
  returning id,revision_no into v_id,v_revision;
 end if;
 return jsonb_build_object('ok',true,'id',v_id,'status','submitted','revision_no',v_revision);
end;
$$;
revoke all on function public.mba_ob_submit_assignment(uuid,smallint,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.mba_ob_submit_assignment(uuid,smallint,text,text,jsonb) to service_role;

create or replace function public.mba_ob_review_assignment(p_id uuid,p_decision text,p_score numeric,p_feedback text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.mba_ob_assignments%rowtype;
begin
 if p_decision not in ('reviewed','revision_requested')
 or char_length(btrim(coalesce(p_feedback,''))) not between 8 and 3000
 or (p_decision='reviewed' and (p_score is null or p_score<0 or p_score>20))
 or (p_decision='revision_requested' and p_score is not null)
 then return jsonb_build_object('ok',false,'error','invalid_review');end if;
 select * into r from public.mba_ob_assignments where id=p_id for update;
 if not found then return jsonb_build_object('ok',false,'error','submission_not_found');end if;
 insert into public.mba_ob_assignment_reviews(submission_id,revision_no,decision,score,feedback)
 values(r.id,r.revision_no,p_decision,p_score,btrim(p_feedback));
 update public.mba_ob_assignments set status=p_decision,score=p_score,feedback=btrim(p_feedback),reviewed_at=now()
 where id=r.id;
 return jsonb_build_object('ok',true,'status',p_decision,'score',p_score);
end;
$$;
revoke all on function public.mba_ob_review_assignment(uuid,text,numeric,text) from public,anon,authenticated;
grant execute on function public.mba_ob_review_assignment(uuid,text,numeric,text) to service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('mba-ob-assignments','mba-ob-assignments',false,8388608,
 array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','image/jpeg','image/png'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No anon/authenticated storage policies are created; only server-side service_role accesses files.
