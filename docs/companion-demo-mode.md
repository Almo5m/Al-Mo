# مشكلة: الرفيق بيقول "وضع تجريبي" رغم رفع المتغيرات

## العَرَض
رسالة "الرفيق مش متوصّل (وضع تجريبي)" بتظهر حتى بعد رفع كل المتغيرات في Supabase.

## السبب
الرسالة كانت بتظهر على أي فشل في الاتصال، مش بس لما المتغيرات ناقصة. فكانت مضللة. الأسباب الحقيقية المحتملة:

1. **متغيرات `VITE_` مش في Vercel.** الواجهة (المتصفح) بتقرا `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` وقت البناء، ومكانها Vercel (Settings → Environment Variables) مش أسرار Supabase. وبعد إضافتهم لازم Redeploy، لأنهم بيتدمجوا في الكود وقت البناء.
2. **`ALLOWED_ORIGIN` مش مطابق للدومين.** لازم يساوي دومين الموقع بالظبط، مثلًا `https://al-mo.vercel.app` (https، من غير `/` في الآخر). لو فاضي أو `localhost` المتصفح بيحجب الرد.
3. **الدالة مش منشورة**: `supabase functions deploy companion` و`supabase functions deploy contact`.
4. **مفتاح من نوع `sb_publishable_`**: Supabase بيرفضه في فحص JWT. الحل: نشر الدالة بـ `--no-verify-jwt` (الدالة محمية أصلًا بفحص الدومين وحد الاستخدام).

أغلب فشل الحالات دي بيوصل للمتصفح كأنه "مفيش اتصال"، عشان كده كان بيظهر نفس الرسالة.

## اللي اتعدّل (v0.18)
- `src/lib/edge.ts`: نداء الدوال في مكان واحد. الزائر بيشوف رسالة هادية ("الرفيق مش متاح دلوقتي..."). وصاحب الموقع بيلاقي **السبب الحقيقي في Console المتصفح** (سطر يبدأ بـ `[AL MO]`).
- `supabase/functions/_shared/http.ts`: `ALLOWED_ORIGIN` بقى يقبل أكتر من دومين بفاصلة (مثلًا `https://al-mo.vercel.app,http://localhost:5173`).

## إزاي تشخّص بالظبط
افتح الموقع، جرّب الرفيق، وافتح Console (F12). السطر اللي يظهر بيقولك السبب. أو من الطرفية (غيّر القيم):

```bash
curl -i -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/companion" \
  -H "Origin: https://al-mo.vercel.app" \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

| الرد | المعنى |
|---|---|
| 200 + `reply` | كله شغال. المشكلة في Vercel (متغيرات `VITE_` أو Redeploy) |
| 404 | الدالة مش منشورة |
| 401 | رفض المفتاح: انشر بـ `--no-verify-jwt` |
| 403 `origin` | `ALLOWED_ORIGIN` مش مطابق |
| 500 | مشكلة في `AI_API_KEY` أو `AI_MODEL` (شوف Logs الدالة) |

بعد تعديل أي سر: `supabase secrets set ALLOWED_ORIGIN=...` (مش محتاج نشر تاني). وبعد تعديل الكود: انشر الدالتين.
