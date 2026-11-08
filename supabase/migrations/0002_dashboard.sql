-- لوحة التحكم: الأدمن، الزيارات (events)، الآراء (reviews)، وصندوق الطلبات.
-- شغّله مرة واحدة من Supabase → SQL Editor (بعد 0001_init.sql).
-- المبدأ: كل الجداول مقفولة. المتصفح (anon) ما يلمسهاش خالص. الأدمن بس يقرأ ويعدّل، وبشرط تسجيل دخول + كود التحقق (aal2).
-- الكتابة من الموقع بتعدّي من دوال السيرفر (service role) بس.

create extension if not exists pgcrypto with schema extensions;

-- ===== الأدمن =====
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
-- مفيش policies عمدًا: القراءة من الدالة تحت بس.

-- أدمن = موجود في جدول admins + دخل بكود التحقق (aal2). مجرد كلمة السر مش كفاية.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid())
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ===== صندوق الطلبات (جدول contact_requests الموجود) =====
alter table public.contact_requests
  add column if not exists status text not null default 'new',
  add column if not exists note text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contact_requests_status_chk') then
    alter table public.contact_requests
      add constraint contact_requests_status_chk check (status in ('new', 'read', 'replied', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contact_requests_note_chk') then
    alter table public.contact_requests
      add constraint contact_requests_note_chk check (note is null or char_length(note) <= 2000);
  end if;
end;
$$;

create index if not exists contact_requests_created_idx on public.contact_requests (created_at desc);

drop trigger if exists contact_requests_touch on public.contact_requests;
create trigger contact_requests_touch before update on public.contact_requests
  for each row execute function public.touch_updated_at();

revoke all on public.contact_requests from anon, authenticated;
grant select, delete on public.contact_requests to authenticated;
grant update (status, note) on public.contact_requests to authenticated;

drop policy if exists admin_select on public.contact_requests;
drop policy if exists admin_update on public.contact_requests;
drop policy if exists admin_delete on public.contact_requests;
create policy admin_select on public.contact_requests for select to authenticated using (public.is_admin());
create policy admin_update on public.contact_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.contact_requests for delete to authenticated using (public.is_admin());

revoke all on public.rate_limits from anon, authenticated;

-- ===== الزيارات =====
-- من غير كوكيز، ومن غير IP: visitor هاش بيتغيّر كل يوم (الدالة بتحسبه ومبتخزنش الـ IP).
-- الصف الواحد = (يوم، زائر، نوع، اسم)، فالزائر بيتعد مرة واحدة في اليوم لكل حدث.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  day date not null default ((now() at time zone 'utc')::date),
  visitor text not null check (char_length(visitor) <= 32),
  type text not null check (type in ('view', 'section', 'demo', 'channel', 'chat', 'handoff', 'form', 'lang')),
  name text not null default '' check (name ~ '^[a-z0-9_.:-]{0,40}$'),
  ref text check (ref is null or char_length(ref) <= 80),
  device text check (device is null or device in ('mobile', 'tablet', 'desktop')),
  browser text check (browser is null or char_length(browser) <= 20),
  lang text check (lang is null or lang in ('ar', 'en')),
  country text check (country is null or char_length(country) = 2)
);
create unique index if not exists events_dedupe on public.events (day, visitor, type, name);
create index if not exists events_day_idx on public.events (day);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant select on public.events to authenticated;
drop policy if exists admin_select on public.events;
create policy admin_select on public.events for select to authenticated using (public.is_admin());

create or replace function public.track_event(
  p_visitor text, p_type text, p_name text, p_ref text,
  p_device text, p_browser text, p_lang text, p_country text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.events (visitor, type, name, ref, device, browser, lang, country)
  values (p_visitor, p_type, coalesce(p_name, ''), p_ref, p_device, p_browser, p_lang, p_country)
  on conflict (day, visitor, type, name) do nothing;
$$;
revoke all on function public.track_event(text, text, text, text, text, text, text, text) from public, anon, authenticated;

-- ===== الآراء =====
-- invited: اللينك اتعمل ولسه العميل ما كتبش · pending: كتب وبيستنى مراجعتك
-- approved: ظاهر في الموقع · hidden: مخفي مؤقتًا · rejected: مرفوض
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  token_hash text not null unique,
  label text not null default '' check (char_length(label) <= 80),
  project text check (project is null or char_length(project) <= 80),
  expires_at timestamptz not null,
  status text not null default 'invited' check (status in ('invited', 'pending', 'approved', 'hidden', 'rejected')),
  author_name text check (author_name is null or char_length(author_name) <= 80),
  author_role text check (author_role is null or char_length(author_role) <= 120),
  body text check (body is null or char_length(body) <= 1500),
  display_body text check (display_body is null or char_length(display_body) <= 1500),
  rating smallint check (rating is null or rating between 1 and 5),
  lang text check (lang is null or lang in ('ar', 'en')),
  consent_public boolean not null default false,
  submitted_at timestamptz,
  approved_at timestamptz,
  sort int not null default 0
);
create index if not exists reviews_status_idx on public.reviews (status);

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select, delete on public.reviews to authenticated;
grant update (status, label, project, author_name, author_role, display_body, sort) on public.reviews to authenticated;

drop policy if exists admin_select on public.reviews;
drop policy if exists admin_update on public.reviews;
drop policy if exists admin_delete on public.reviews;
create policy admin_select on public.reviews for select to authenticated using (public.is_admin());
create policy admin_update on public.reviews for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.reviews for delete to authenticated using (public.is_admin());

create or replace function public.reviews_before_update()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' and new.approved_at is null then
    new.approved_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists reviews_approve on public.reviews;
create trigger reviews_approve before update on public.reviews
  for each row execute function public.reviews_before_update();

-- لينك تقييم جديد: التوكن بيتولّد هنا وبيرجع مرة واحدة، وجوه الجدول بيتخزّن الهاش بس.
create or replace function public.create_review_invite(p_label text, p_project text default null, p_days int default 14)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text;
  d int := least(greatest(coalesce(p_days, 14), 1), 90);
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  tok := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
  insert into public.reviews (token_hash, label, project, expires_at)
  values (
    encode(extensions.digest(tok, 'sha256'), 'hex'),
    left(coalesce(p_label, ''), 80),
    nullif(left(coalesce(p_project, ''), 80), ''),
    now() + make_interval(days => d)
  );
  return tok;
end;
$$;

-- تجديد لينك لسه ما اتستخدمش (ينفع لو اللينك ضاع أو انتهى)
create or replace function public.regenerate_review_invite(p_id uuid, p_days int default 14)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text;
  d int := least(greatest(coalesce(p_days, 14), 1), 90);
  n int;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  tok := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
  update public.reviews
     set token_hash = encode(extensions.digest(tok, 'sha256'), 'hex'),
         expires_at = now() + make_interval(days => d)
   where id = p_id and status = 'invited';
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'not_found';
  end if;
  return tok;
end;
$$;

-- الآراء المقبولة للموقع (حقول آمنة بس). الوحيدة المتاحة للزائر.
create or replace function public.get_public_reviews()
returns table (id uuid, author_name text, author_role text, body text, rating smallint, lang text)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.author_name, r.author_role, coalesce(r.display_body, r.body), r.rating, r.lang
    from public.reviews r
   where r.status = 'approved' and r.consent_public
   order by r.sort desc, r.approved_at desc nulls last
   limit 30;
$$;
revoke all on function public.get_public_reviews() from public;
grant execute on function public.get_public_reviews() to anon, authenticated;

-- ===== إحصائيات اللوحة (استدعاء واحد) =====
create or replace function public.admin_overview(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d int := least(greatest(coalesce(p_days, 30), 1), 365);
  today date := (now() at time zone 'utc')::date;
  since date;
  res jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  since := today - (d - 1);

  with e as (select * from public.events where day >= since),
       v as (select * from e where type = 'view')
  select jsonb_build_object(
    'days', d,
    'total_views', (select count(*) from v),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', to_char(g.day, 'YYYY-MM-DD'), 'visitors', coalesce(c.n, 0)) order by g.day), '[]'::jsonb)
        from generate_series(since::timestamp, today::timestamp, interval '1 day') as g(day)
        left join (select day, count(*) as n from v group by day) c on c.day = g.day::date
    ),
    'refs', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
               from (select coalesce(nullif(ref, ''), 'direct') as k, count(*) as c from v group by 1 order by 2 desc limit 10) x),
    'devices', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                  from (select coalesce(device, 'unknown') as k, count(*) as c from v group by 1) x),
    'browsers', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                   from (select coalesce(browser, 'unknown') as k, count(*) as c from v group by 1) x),
    'langs', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                from (select coalesce(lang, 'unknown') as k, count(*) as c from v group by 1) x),
    'countries', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                    from (select country as k, count(*) as c from v where country is not null group by 1 order by 2 desc limit 10) x),
    'sections', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                   from (select name as k, count(*) as c from e where type = 'section' group by 1) x),
    'actions', (select coalesce(jsonb_agg(to_jsonb(x) order by x.c desc), '[]'::jsonb)
                  from (select type || ':' || name as k, count(*) as c from e
                         where type in ('demo', 'channel', 'lang', 'chat', 'handoff', 'form') group by 1) x),
    'funnel', jsonb_build_object(
      'view', (select count(distinct visitor) from v),
      'projects', (select count(distinct visitor) from e where type = 'section' and name = 'projects'),
      'demo', (select count(distinct visitor) from e where type = 'demo'),
      'chat', (select count(distinct visitor) from e where type = 'chat'),
      'request', (select count(distinct visitor) from e where type in ('form', 'handoff'))
    ),
    'new_requests', (select count(*) from public.contact_requests where status = 'new'),
    'pending_reviews', (select count(*) from public.reviews where status = 'pending')
  ) into res;

  return res;
end;
$$;

-- حذف الزيارات القديمة (بيتنادى من إعدادات اللوحة)
create or replace function public.purge_old_events(p_days int default 400)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from public.events where day < ((now() at time zone 'utc')::date - greatest(coalesce(p_days, 400), 30));
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.create_review_invite(text, text, int) from public, anon;
revoke all on function public.regenerate_review_invite(uuid, int) from public, anon;
revoke all on function public.admin_overview(int) from public, anon;
revoke all on function public.purge_old_events(int) from public, anon;
grant execute on function public.create_review_invite(text, text, int) to authenticated;
grant execute on function public.regenerate_review_invite(uuid, int) to authenticated;
grant execute on function public.admin_overview(int) to authenticated;
grant execute on function public.purge_old_events(int) to authenticated;
