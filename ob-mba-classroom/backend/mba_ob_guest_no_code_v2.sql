-- Guest registration now needs only first name, family name and instructor approval.
-- Keep old code references nullable for historical records; no new guest code is required.
alter table public.mba_ob_guests alter column code_id drop not null;
comment on column public.mba_ob_guests.code_id is 'Legacy optional guest code reference. New guests register without a code.';
