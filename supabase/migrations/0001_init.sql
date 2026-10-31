-- الجداول مقفولة بالكامل: القراءة والكتابة من الدالة بس (service role).
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 80),
  email text not null check (char_length(email) <= 254),
  summary text not null check (char_length(summary) <= 4000),
  source text not null default 'companion'
);

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

alter table public.contact_requests enable row level security;
alter table public.rate_limits enable row level security;
-- مفيش policies عمدًا: أي وصول من المتصفح مرفوض.

-- عدّاد حدود الرسائل (ذري، مفيش سباق بين طلبين)
create or replace function public.hit_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare c int;
begin
  insert into rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                        then now() else r.window_start end,
    count = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                 then 1 else r.count + 1 end
  returning count into c;
  return c <= p_max;
end;
$$;

revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
