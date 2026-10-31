# بورتفوليو معاذ

ده موقعي الشخصي، وعايزه يبقى شبهي: ثيم لعبة، غموض بسيط، ورفيق AI بيتكلم مع الزائر. ومش مخبّي إني بستخدم الـ AI في الشغل، دي جزء من القصة.

## اللي جواه
- واجهة بـ Vite + React + TypeScript.
- الرفيق: دالة في Supabase بتحمي مفتاح الـ AI، وبتحدد عدد الرسائل لكل زائر، وبتبعتلي ملخص طلب الزائر على تليجرام وإيميل لو وافق.
- نظام التصميم كله متسجّل في `src/styles/tokens.css`.

## تشغيله عندك
```bash
npm install
cp .env.example .env   # وحط قيم Supabase بتاعتك
npm run dev
```

## تشغيل الرفيق
```bash
supabase link --project-ref <مشروعك>
supabase db push
supabase secrets set --env-file supabase/.env
supabase functions deploy companion
supabase functions deploy contact
```
وبعدها حط `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` في `.env`. من غيرهم الحوار بيشتغل في وضع تجريبي.

## الأسرار
أي مفتاح (الـ AI، تليجرام، الإيميل) بيتحط في أسرار Supabase مش في الكود. شوف `supabase/.env.example`. ملفات `.env` متتجاهلة في Git.

## الهيكل
```
src/                الواجهة (sections, components, companion, i18n, styles)
supabase/           الجداول والدوال
PROJECT_MEMORY.md   سجل أحداث المشروع
PRIVACY.md          سياسة الخصوصية
LICENSE             حقوق الملكية
```

## الخصوصية والحقوق
اقرا `PRIVACY.md` و`LICENSE`.
