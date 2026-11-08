import type { Lang } from "./index";

export type LegalDoc = "privacy" | "license";

// TODO: مسودة لازم تتراجع قبل النشر. نفس محتوى PRIVACY.md و LICENSE.
export const LEGAL: Record<Lang, Record<LegalDoc, { title: string; body: string[] }>> = {
  ar: {
    privacy: {
      title: "سياسة الخصوصية (مسودة)",
      body: [
        "الموقع بتديره AL MO Digital Solutions.",
        "بنجمع: رسائلك للرفيق، وبيانات الفورم (الاسم والإيميل والرسالة) لو بعتها، ونسخة مُشفّرة (هاش) من عنوان الـ IP لمنع الإساءة. مش بنخزّن الـ IP نفسه. وكمان إحصائيات زيارات مجهولة (اليوم، نوع الجهاز والمتصفح واللغة، الدولة لو متاحة، الدومين اللي جيت منه، والأقسام اللي وصلتها). من غير كوكيز، والـ IP بيُستخدم لحظيًا لحساب كود مجهول بيتغيّر كل يوم ومبيتخزّنش. ولو كتبت رأي من لينك التقييم، بنحفظ اسمك ووظيفتك ورأيك وتقييمك، وبيظهروا للعامة بعد مراجعتنا وموافقتك.",
        "بنستخدمها عشان الرفيق يرد عليك، ونستلم طلبك ونرد عليك، ونحمي الموقع.",
        "اللي بيستلم بياناتك: مزوّد الـ AI اللي بيعالج رسائلك، وSupabase للتخزين، وتليجرام وخدمة إيميل لإشعارنا بطلبك. وكمان Vercel لاستضافة الموقع، وGoogle Fonts لتحميل الخطوط، وGitHub Pages للديمو (لما تفتحه بس)، وده بيخليهم يشوفوا عنوان الـ IP بتاعك زي أي موقع بتزوره.",
        "الرفيق مساعد AI مش إنسان، وملخص حوارك بيوصلنا بس بعد موافقتك الصريحة.",
        "الاحتفاظ: الطلبات [180 يوم]، الزيارات المجهولة [400 يوم]، والآراء لحد ما تطلب حذفها. بنحترم إعدادات Do Not Track، ومفيش أدوات تتبع خارجية أو إعلانات.",
        "لطلب نسخة من بياناتك أو حذفها، تواصل معنا على moaz2009amen@gmail.com.",
      ],
    },
    license: {
      title: "حقوق الملكية",
      body: [
        "© 2026 AL MO Digital Solutions. جميع الحقوق محفوظة.",
        "مفيش إذن بنسخ أو تعديل أو إعادة نشر أي جزء من الموقع ده من غير موافقة كتابية من AL MO Digital Solutions.",
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy policy (draft)",
      body: [
        "This site is run by AL MO Digital Solutions.",
        "We collect: your messages to the companion, form data (name, email, message) if you send it, and a hashed copy of your IP address to prevent abuse. We don't store the IP itself. We also collect anonymous visit statistics (the day, device type, browser and language, country if available, the domain you came from, and the sections you reached). No cookies, and the IP is used momentarily to compute an anonymous code that changes every day and is not stored. If you write a review through a review link, we store your name, role, review and rating, and they are shown publicly after our review and your consent.",
        "We use it so the companion can reply, to receive your request and reply to you, and to protect the site.",
        "Who receives your data: the AI provider that processes your messages, Supabase for storage, and Telegram and an email service to notify us of your request. Also Vercel for hosting, Google Fonts for loading fonts, and GitHub Pages for the demo (only when you open it), which means they can see your IP address like any site you visit.",
        "The companion is an AI assistant, not a human, and a summary of your chat is sent to us only after your explicit consent.",
        "Retention: requests [180 days], anonymous visits [400 days], and reviews until you ask for deletion. We respect Do Not Track, and there are no external tracking tools or ads.",
        "To request a copy of your data or its deletion, contact us at moaz2009amen@gmail.com.",
      ],
    },
    license: {
      title: "Ownership",
      body: [
        "© 2026 AL MO Digital Solutions. All rights reserved.",
        "No permission is granted to copy, modify or republish any part of this site without written consent from AL MO Digital Solutions.",
      ],
    },
  },
};
