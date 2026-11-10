# ترويسات الأمان (vercel.json)

الملف `vercel.json` بيضيف على كل صفحة في الموقع ترويسات أمان. أهمها سياسة الـ CSP، وهي بتقول للمتصفح مين مسموح يحمّل إيه، فلو حد قدر يحقن سكريبت في الصفحة المتصفح يرفض يشغّله.

## اللي فيه
| الترويسة | بتعمل إيه |
|---|---|
| `Content-Security-Policy` | تحدد المصادر المسموحة للسكريبتات والخطوط والصور والاتصالات وإطارات الديمو |
| `Strict-Transport-Security` | تجبر المتصفح يستخدم HTTPS دايمًا |
| `X-Frame-Options: DENY` و`frame-ancestors 'none'` | تمنع أي موقع يعرض موقعنا جوه iframe (حماية من الخداع بالنقر) |
| `X-Content-Type-Options: nosniff` | تمنع المتصفح يخمّن نوع الملف |
| `Referrer-Policy` | تقلل بيانات الرابط المبعوتة للمواقع التانية |
| `Permissions-Policy` | تقفل الكاميرا والمايك والموقع والدفع والـ USB (مش محتاجينهم) |
| `Cross-Origin-Opener-Policy` | تعزل نافذة الموقع عن أي نافذة تانية بتفتحه |
| `Cache-Control` لـ `/assets/*` | ملفات الكود المتبصّمة بتتخزن سنة |

## الدومينات المسموحة في الـ CSP
- **الخطوط:** `fonts.googleapis.com` و`fonts.gstatic.com`.
- **الاتصال بالسيرفر:** `*.supabase.co` (الرفيق والفورم واللوحة).
- **صور المعاينة اللي بترفعها من اللوحة:** `*.supabase.co` في `img-src` (Supabase Storage).
- **الديمو في النافذة (`frame-src`):** `almo5m.github.io` بس.
- باقي المصادر `'self'` يعني دومين الموقع نفسه.
- `'unsafe-inline'` للـ CSS فقط (مش للسكريبتات). السكريبتات `'self'` بس، وعشان كده سكريبت اللغة اتنقل من `index.html` لملف `public/lang-init.js`.

## لما تضيف ديمو جديد
أي ديمو على دومين تاني لازم تضيف دومينه في `frame-src` في `vercel.json`، وإلا المتصفح هيحجب النافذة. مثال: `frame-src https://almo5m.github.io https://demo2.example.com`. وكمان لازم الديمو نفسه يسمح بالتضمين (مفيش `X-Frame-Options: DENY` عنده).

## لو حاجة باظت بعد النشر
افتح Console في المتصفح (F12). لو حاجة اتحجبت هتلاقي سطر بيبدأ بـ `Refused to ...` بيقولك إيه اللي اتحجب وبأنهي قاعدة. ابعتهولي وأعدّل القاعدة.

## تحسينات ممكنة بعدين
- تضييق `*.supabase.co` لدومين مشروعك بالظبط (`https://REF.supabase.co`).
- تحميل الخطوط من نفس الدومين بدل Google، فنشيل دومينين من الـ CSP والزائر ما بيبعتش بياناته لـ Google.

## للتأكد بعد النشر
```bash
curl -sI https://al-mo.vercel.app | grep -i "content-security\|strict-transport\|x-frame"
```
أو افتح الدومين على موقع securityheaders.com.

## صفحتا /admin و/review
- `vercel.json` فيه `rewrites` للمسارين دول (الموقع تطبيق صفحة واحدة، فالمسار لازم يرجع لـ `index.html`).
- ليهم ترويسات زيادة: `X-Robots-Tag: noindex` عشان محركات البحث ما تفهرسهمش، و`Cache-Control: no-store`.
- نفس الـ CSP بيحميهم: السكريبتات `'self'` بس، والاتصال بـ `*.supabase.co` بس. صورة QR بتيجي كـ `data:` وده مسموح في `img-src`.
