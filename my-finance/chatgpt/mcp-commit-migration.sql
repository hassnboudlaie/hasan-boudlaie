-- My Finance ChatGPT plugin: atomic owner-scoped commit after explicit in-chat approval.
-- Does NOT enable Supabase OAuth on this shared project.
-- No service_role use. Postgres RLS remains enforced through SECURITY INVOKER.
alter table public.finance_chatgpt_drafts
 add column if not exists confirmed_at timestamptz,
 add column if not exists confirmed_entry_id uuid,
 add column if not exists confirmed_object_id uuid;

create or replace function public.finance_confirm_chatgpt_draft(p_draft_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
 v_uid uuid := auth.uid();
 v_client text := auth.jwt() ->> 'client_id';
 v_conn public.finance_chatgpt_connections%rowtype;
 v_draft public.finance_chatgpt_drafts%rowtype;
 v_active boolean;
 v_account_id uuid;
 v_account_name text;
 v_account_currency text;
 v_matches integer;
 v_amount numeric(18,2);
 v_entry_id uuid;
 v_object_id uuid;
 v_when timestamptz;
 v_note text;
begin
 if v_uid is null or v_client is null or char_length(v_client) < 8 then
  raise exception 'AUTHENTICATED_OAUTH_REQUIRED' using errcode = '42501';
 end if;

 select * into v_conn
 from public.finance_chatgpt_connections
 where user_id = v_uid and enabled and allow_drafts and oauth_client_id = v_client
 for update;
 if not found then raise exception 'CHATGPT_CONSENT_DENIED' using errcode = '42501'; end if;

 select a.status = 'active' and (a.expires_at is null or a.expires_at > now())
 into v_active
 from public.finance_access a where a.user_id = v_uid;
 if coalesce(v_active,false) is false then
  raise exception 'FINANCE_ACCOUNT_INACTIVE' using errcode = '42501';
 end if;

 select * into v_draft
 from public.finance_chatgpt_drafts
 where id = p_draft_id and user_id = v_uid
 for update;
 if not found then raise exception 'DRAFT_NOT_FOUND' using errcode = 'P0002'; end if;

 if v_draft.status = 'accepted' then
  return jsonb_build_object(
   'status','already_recorded','draft_id',v_draft.id,
   'entry_id',v_draft.confirmed_entry_id,'receivable_id',v_draft.confirmed_object_id);
 end if;
 if v_draft.status not in ('pending','opened') or v_draft.expires_at <= now() then
  raise exception 'DRAFT_NOT_PENDING' using errcode = '22023';
 end if;
 if v_draft.occurred_on > (now() at time zone 'Asia/Tehran')::date then
  raise exception 'FUTURE_TRANSACTION_DATE' using errcode = '22023';
 end if;
 if v_draft.amount is null or v_draft.amount<=0 or v_draft.amount>1000000000000000
  or v_draft.currency not in ('IRT','IRR','USD','EUR') then
  raise exception 'INVALID_FINANCIAL_AMOUNT' using errcode = '22023';
 end if;
 if v_draft.action not in ('income','expense','loan_given') then
  raise exception 'ACTION_NOT_SUPPORTED' using errcode = '22023';
 end if;

 v_amount:=v_draft.amount;
 v_account_name:=null;
 v_account_currency:=v_draft.currency;
 if nullif(btrim(v_draft.account_name),'') is not null then
  select count(*),max(a.id),max(a.payload->>'name'),max(a.payload->>'currency')
  into v_matches,v_account_id,v_account_name,v_account_currency
  from public.finance_objects a
  where a.user_id = v_uid and a.kind = 'account'
   and lower(btrim(coalesce(a.payload->>'name','')))=lower(btrim(v_draft.account_name));
  if v_matches<>1 then
   raise exception 'ACCOUNT_NOT_FOUND_OR_AMBIGUOUS' using errcode = '22023';
  end if;
  if v_account_currency<>v_draft.currency then
   if v_draft.currency='IRT' and v_account_currency='IRR' then
    v_amount:=v_draft.amount*10;
   elsif v_draft.currency='IRR' and v_account_currency='IRT' then
    v_amount:=v_draft.amount/10;
   else
    raise exception 'ACCOUNT_CURRENCY_MISMATCH' using errcode = '22023';
   end if;
  end if;
  if v_amount<=0 or v_amount>1000000000000000 then
   raise exception 'CONVERTED_AMOUNT_OUT_OF_RANGE' using errcode = '22023';
  end if;
 end if;

 v_when := (v_draft.occurred_on::timestamp + interval '12 hours') at time zone 'Asia/Tehran';
 if v_draft.occurred_on=(now() at time zone 'Asia/Tehran')::date then v_when:=now(); end if;
 v_note := left(coalesce(v_draft.memo,''),500);

 if v_draft.action='loan_given' then
  if nullif(btrim(v_draft.person),'') is null then
   raise exception 'LOAN_COUNTERPARTY_REQUIRED' using errcode = '22023';
  end if;
  v_object_id:=gen_random_uuid();
  insert into public.finance_objects(id,user_id,kind,payload)
  values(v_object_id,v_uid,'receivable',jsonb_build_object(
   'id',v_object_id,'counterparty',v_draft.person,
   'principal',v_draft.amount,'expected',v_draft.amount,
   'currency',v_draft.currency,'termMonths',null,'dueMonth','',
   'location','','sector','قرض پرداختی','notes',v_note,
   'status','pending','createdAt',v_when,
   'disbursementAccountId',v_account_id,'disbursedAt',v_when));
  if v_account_id is not null then
   v_entry_id:=gen_random_uuid();
   insert into public.finance_entries
    (id,user_id,entry_type,amount,currency,category,description,occurred_at,status,source,metadata)
   values(v_entry_id,v_uid,'investment',v_amount,v_account_currency,
    'پرداخت اصل قرض به '||v_draft.person,'پرداخت قرض · '||v_note,
    v_when,'completed','chatgpt',
    jsonb_build_object('accountId',v_account_id,'accountName',v_account_name,
     'scope','personal','receivableId',v_object_id));
  end if;
 else
  v_entry_id:=gen_random_uuid();
  insert into public.finance_entries
   (id,user_id,entry_type,amount,currency,category,description,occurred_at,status,source,metadata)
  values(v_entry_id,v_uid,v_draft.action,v_amount,v_account_currency,
   coalesce(nullif(btrim(v_draft.category),''),'سایر'),v_note,
   v_when,'completed','chatgpt',
   jsonb_build_object('accountId',v_account_id,'accountName',v_account_name,'scope','personal'));
 end if;

 update public.finance_chatgpt_drafts
 set status='accepted',confirmed_at=now(),confirmed_entry_id=v_entry_id,
  confirmed_object_id=v_object_id,updated_at=now()
 where id=v_draft.id and user_id=v_uid;

 return jsonb_build_object('status','recorded','draft_id',v_draft.id,
  'action',v_draft.action,'amount',v_draft.amount,'currency',v_draft.currency,
  'account',v_account_name,'entry_id',v_entry_id,'receivable_id',v_object_id);
end;
$$;

revoke all on function public.finance_confirm_chatgpt_draft(uuid) from public,anon;
grant execute on function public.finance_confirm_chatgpt_draft(uuid) to authenticated;
