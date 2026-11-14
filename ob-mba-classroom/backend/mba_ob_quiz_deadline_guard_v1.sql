-- Database-level deadline and grading guard. Never trust the client clock or claimed score.
create or replace function public.mba_ob_quiz_attempt_guard()
returns trigger language plpgsql set search_path=public as $$
declare v_window public.mba_ob_quiz_windows%rowtype;
        v_count int;
        v_correct int;
        v_options int;
begin
 select * into v_window from public.mba_ob_quiz_windows
  where session_no=new.session_no for share;
 if not found or statement_timestamp()<v_window.opens_at or statement_timestamp()>=v_window.closes_at
 then raise exception 'quiz_closed' using errcode='P0001'; end if;
 select count(*) into v_count from public.mba_ob_quiz_questions
  where session_no=new.session_no;
 if v_count<>10 or jsonb_array_length(new.answers)<>10
 then raise exception 'question_bank_incomplete' using errcode='P0001'; end if;
 select count(*) into v_options
 from jsonb_array_elements(new.answers) element
 where jsonb_typeof(element.value)<>'number' or element.value::text !~ '^[0-3]$';
 if v_options>0 then raise exception 'invalid_answers' using errcode='P0001';end if;
 select count(*) into v_correct
 from public.mba_ob_quiz_questions q
 where q.session_no=new.session_no
 and (new.answers->>(q.question_no-1))::int=q.correct_index;
 new.correct_count:=v_correct;
 new.score:=v_correct*2;
 new.submitted_at:=statement_timestamp();
 return new;
end
$$;
revoke all on function public.mba_ob_quiz_attempt_guard() from public,anon,authenticated;
drop trigger if exists mba_ob_quiz_deadline_guard on public.mba_ob_quiz_attempts;
create trigger mba_ob_quiz_deadline_guard before insert on public.mba_ob_quiz_attempts
 for each row execute function public.mba_ob_quiz_attempt_guard();
