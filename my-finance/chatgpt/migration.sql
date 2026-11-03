-- My Finance / optional ChatGPT bridge. Separate finance-only tables, no changes to existing apps.
-- Owner identity is always auth.uid(), never supplied by the AI.
create table if not exists public.finance_chatgpt_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  allow_summary boolean not null default false,
  allow_drafts boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_chatgpt_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_key text,
  action text not null check (action in ('expense','income','loan_given')),
  amount numeric(18,2) not null check (amount > 0 and amount <= 1000000000000000),
  currency text not null check (currency in ('IRT','IRR','USD','EUR')),
  person text not null default '' check (char_length(person)<=120),
  account_name text not null default '' check (char_length(account_name)<=120),
  occurred_on date not null,
  category text not null default '' check (char_length(category)<=150),
  memo text not null default '' check (char_length(memo)<=500),
  status text not null default 'pending' check (status in ('pending','opened','dismissed','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '7 days'),
  constraint finance_chatgpt_drafts_request_key_length check (request_key is null or char_length(request_key) between 12 and 100),
  constraint finance_chatgpt_drafts_request_key_uniq unique (user_id,request_key)
);

create index if not exists finance_chatgpt_drafts_latest
on public.finance_chatgpt_drafts(user_id,created_at desc) where status in ('pending','opened');

alter table public.finance_chatgpt_connections enable row level security;
alter table public.finance_chatgpt_drafts enable row level security;
alter table public.finance_chatgpt_connections force row level security;
alter table public.finance_chatgpt_drafts force row level security;

revoke all on public.finance_chatgpt_connections from anon;
revoke all on public.finance_chatgpt_drafts from anon;
grant select,insert,update,delete on public.finance_chatgpt_connections to authenticated;
grant select,insert,update,delete on public.finance_chatgpt_drafts to authenticated;

drop policy if exists "finance_chatgpt_connections_owner_select" on public.finance_chatgpt_connections;
create policy "finance_chatgpt_connections_owner_select"
on public.finance_chatgpt_connections for select to authenticated
using ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_connections_owner_insert" on public.finance_chatgpt_connections;
create policy "finance_chatgpt_connections_owner_insert"
on public.finance_chatgpt_connections for insert to authenticated
with check ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_connections_owner_update" on public.finance_chatgpt_connections;
create policy "finance_chatgpt_connections_owner_update"
on public.finance_chatgpt_connections for update to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_connections_owner_delete" on public.finance_chatgpt_connections;
create policy "finance_chatgpt_connections_owner_delete"
on public.finance_chatgpt_connections for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_drafts_owner_select" on public.finance_chatgpt_drafts;
create policy "finance_chatgpt_drafts_owner_select"
on public.finance_chatgpt_drafts for select to authenticated
using ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_drafts_owner_insert" on public.finance_chatgpt_drafts;
create policy "finance_chatgpt_drafts_owner_insert"
on public.finance_chatgpt_drafts for insert to authenticated
with check ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_drafts_owner_update" on public.finance_chatgpt_drafts;
create policy "finance_chatgpt_drafts_owner_update"
on public.finance_chatgpt_drafts for update to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

drop policy if exists "finance_chatgpt_drafts_owner_delete" on public.finance_chatgpt_drafts;
create policy "finance_chatgpt_drafts_owner_delete"
on public.finance_chatgpt_drafts for delete to authenticated
using ((select auth.uid())=user_id);
