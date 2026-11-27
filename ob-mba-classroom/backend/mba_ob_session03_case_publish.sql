-- Allow 3rd-session six-stage case submissions while preserving all historical rows and teacher reviews.
ALTER TABLE public.mba_ob_case_submissions DROP CONSTRAINT mba_ob_case_submissions_session_no_check;
ALTER TABLE public.mba_ob_case_submissions ADD CONSTRAINT mba_ob_case_submissions_session_no_check CHECK (session_no IN (1,2,3));
create or replace function public.mba_ob_submit_case(
 p_student_id uuid,p_session_no integer,p_answers jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_existing public.mba_ob_case_submissions%rowtype;v_id uuid;
        v_rev integer;v_title text;v_key text;
begin
 if p_session_no not in (1,2,3) then
  return jsonb_build_object('ok',false,'error','case_not_published');
 end if;
 if not exists (select 1 from public.mba_ob_students
  where id=p_student_id and approval_status='approved' and disabled_at is null) then
  return jsonb_build_object('ok',false,'error','approval_required');
 end if;
 if p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>20000
    or (select count(*) from jsonb_object_keys(p_answers))<>6 then
  return jsonb_build_object('ok',false,'error','invalid_case_answers');
 end if;
 foreach v_key in array array['problem','evidence','levels','explain','intervention','measurement'] loop
  if jsonb_typeof(p_answers->v_key) is distinct from 'string'
   or char_length(btrim(p_answers->>v_key)) not between 8 and 3000 then
   return jsonb_build_object('ok',false,'error','incomplete_case_answer','field',v_key);
  end if;
 end loop;
 v_title:=case p_session_no when 1 then 'مرکز خدمات سپهر: افزایش تعداد پاسخ‌ها، افت کیفیت'
                                  when 2 then 'ارزیابی عملکرد در واحد فروش: وقتی برداشت جای شواهد را می‌گیرد'
                                  when 3 then 'تناسب نقش یا برچسب شخصیت؟'
                                  end;
 select * into v_existing from public.mba_ob_case_submissions
  where student_id=p_student_id and session_no=p_session_no for update;
 if found and v_existing.status<>'revision_requested' then
  return jsonb_build_object('ok',false,'error','case_already_submitted','status',v_existing.status);
 end if;
 if found then
  update public.mba_ob_case_submissions set
    answers=p_answers,case_title=v_title,framework_version=1,
    status='submitted',score=null,feedback=null,reviewed_at=null,
    submitted_at=clock_timestamp(),updated_at=clock_timestamp(),revision_no=revision_no+1
    where id=v_existing.id returning id,revision_no into v_id,v_rev;
 else
  insert into public.mba_ob_case_submissions(student_id,session_no,case_title,answers)
    values(p_student_id,p_session_no,v_title,p_answers)
    returning id,revision_no into v_id,v_rev;
 end if;
 return jsonb_build_object('ok',true,'status','submitted','id',v_id,'revision_no',v_rev);
end;
$$;
