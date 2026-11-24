-- Opening takes effect when applied. The exclusive boundaries are midnight in Tehran.
insert into public.mba_ob_quiz_windows (session_no, opens_at, closes_at)
values
  (1, statement_timestamp(), timestamptz '2026-11-28T00:00:00+03:30'),
  (2, statement_timestamp(), timestamptz '2026-12-05T00:00:00+03:30')
on conflict (session_no) do nothing;
