-- التحكم في المحتوى من اللوحة: المشاريع، إعدادات الموقع، وصور معاينة المشاريع.
-- شغّله من Supabase → SQL Editor بعد 0002_dashboard.sql.
-- الموقع بيقرأ من دالة get_site_content (للعامة، حقول آمنة بس)، والأدمن بس (بكود التحقق) هو اللي يكتب.

-- ملحوظة: PostgreSQL بيرفض أي تكرار في الـ regex أكبر من 255 ({n,m})، فالحدود هنا 250.

-- ===== المشاريع =====
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,38}$'),
  sort int not null default 0,
  visible boolean not null default true,
  tags text[] not null default '{}' check (cardinality(tags) <= 8 and octet_length(array_to_string(tags, ',')) <= 200),
  demo_url text check (demo_url is null or demo_url ~ '^https://[^\s]{3,250}$'),
  preview_url text check (preview_url is null or preview_url ~ '^(/projects/[A-Za-z0-9._/-]{1,120}|https://[^\s]{3,250})$'),
  title_ar text not null check (char_length(title_ar) between 1 and 120),
  title_en text not null check (char_length(title_en) between 1 and 120),
  desc_ar text not null default '' check (char_length(desc_ar) <= 600),
  desc_en text not null default '' check (char_length(desc_en) <= 600),
  impact_ar text not null default '' check (char_length(impact_ar) <= 400),
  impact_en text not null default '' check (char_length(impact_en) <= 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select, insert, update, delete on public.projects to authenticated;
drop policy if exists admin_all on public.projects;
create policy admin_all on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===== إعدادات الموقع =====
-- contact_links: {whatsapp, telegram, email} · sections: {companion, process} · floating: {enabled, bubble_enabled, bubble_ar, bubble_en}
create table if not exists public.site_settings (
  key text primary key check (key in ('contact_links', 'sections', 'floating')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- تحقق من القيم قبل الحفظ: الروابط لازم https أو mailto (عشان محدش يحط javascript: في رابط)
create or replace function public.site_settings_validate()
returns trigger
language plpgsql
as $$
declare
  k text;
  v jsonb;
begin
  if jsonb_typeof(new.value) <> 'object' then
    raise exception 'invalid setting';
  end if;

  if new.key = 'contact_links' then
    for k, v in select * from jsonb_each(new.value) loop
      if k not in ('whatsapp', 'telegram', 'email') or jsonb_typeof(v) <> 'string'
         or (v #>> '{}') !~ '^((https://|mailto:)[^\s]{1,250})?$' then
        raise exception 'invalid contact link';
      end if;
    end loop;
  elsif new.key = 'sections' then
    for k, v in select * from jsonb_each(new.value) loop
      if k not in ('companion', 'process') or jsonb_typeof(v) <> 'boolean' then
        raise exception 'invalid sections';
      end if;
    end loop;
  elsif new.key = 'floating' then
    for k, v in select * from jsonb_each(new.value) loop
      if k in ('enabled', 'bubble_enabled') then
        if jsonb_typeof(v) <> 'boolean' then
          raise exception 'invalid floating';
        end if;
      elsif k in ('bubble_ar', 'bubble_en') then
        if jsonb_typeof(v) <> 'string' or char_length(v #>> '{}') > 120 then
          raise exception 'invalid floating';
        end if;
      else
        raise exception 'invalid floating';
      end if;
    end loop;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_settings_check on public.site_settings;
create trigger site_settings_check before insert or update on public.site_settings
  for each row execute function public.site_settings_validate();

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
drop policy if exists admin_all on public.site_settings;
create policy admin_all on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===== للموقع (العامة): المشاريع الظاهرة + الإعدادات =====
create or replace function public.get_site_content()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.slug, 'tags', to_jsonb(p.tags), 'demo_url', p.demo_url, 'preview_url', p.preview_url,
        'title_ar', p.title_ar, 'title_en', p.title_en, 'desc_ar', p.desc_ar, 'desc_en', p.desc_en,
        'impact_ar', p.impact_ar, 'impact_en', p.impact_en
      ) order by p.sort, p.created_at)
      from public.projects p where p.visible
    ), '[]'::jsonb),
    'settings', coalesce((select jsonb_object_agg(s.key, s.value) from public.site_settings s), '{}'::jsonb)
  );
$$;
revoke all on function public.get_site_content() from public;
grant execute on function public.get_site_content() to anon, authenticated;

-- ===== صور المعاينة (Storage) =====
-- الـ bucket عام للقراءة (الصور بتظهر في الموقع)، والرفع والتعديل والحذف للأدمن بس. حد أقصى 1MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-previews', 'project-previews', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists previews_admin_insert on storage.objects;
drop policy if exists previews_admin_update on storage.objects;
drop policy if exists previews_admin_delete on storage.objects;
create policy previews_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'project-previews' and public.is_admin());
create policy previews_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'project-previews' and public.is_admin());
create policy previews_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'project-previews' and public.is_admin());

-- ===== المشروع الحالي (نفس اللي في الموقع دلوقتي، عشان ما يتغيّرش حاجة) =====
insert into public.projects (slug, sort, tags, demo_url, preview_url, title_ar, title_en, desc_ar, desc_en, impact_ar, impact_en)
values (
  'spare-parts', 10,
  array['React', 'TypeScript', 'Supabase', 'PWA'],
  'https://almo5m.github.io/spare-parts-demo/',
  '/projects/spare-parts.webp',
  'نظام إدارة مخزن قطع غيار السيارات',
  'Auto spare parts inventory system',
  'نظام لإدارة المخزون والمبيعات والمشتريات: فواتير بيع من أكتر من مخزن، طلبيات شراء، مرتجعات، جرد، وكشوف حساب للعملاء.',
  'A system for managing stock, sales and purchasing: multi-warehouse sales invoices, purchase orders, returns, stocktaking, and customer statements.',
  'أرباح دقيقة مش تقريبية: كل عملية شراء بتتسجل كدفعة لوحدها والبيع بيسحب من أقدم دفعة (FIFO)، فبتعرف ربح كل قطعة بالظبط.',
  'Accurate profit, not estimates: every purchase is tracked as its own lot and sales draw from the oldest lot first (FIFO), so the profit on each item is exact.'
)
on conflict (slug) do nothing;
