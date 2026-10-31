import type { Lang } from "./index";

export type LegalDoc = "privacy" | "license";

// TODO(معاذ): مسودة لازم تتراجع قبل النشر. نفس محتوى PRIVACY.md و LICENSE.
export const LEGAL: Record<Lang, Record<LegalDoc, { title: string; body: string[] }>> = {
  ar: {
    privacy: {
      title: "سياسة الخصوصية (مسودة)",
      body: [
        "الموقع بيديره معاذ، مؤسس AL MO Digital Solutions.",
        "بنجمع: رسائلك للرفيق، وبيانات الفورم (الاسم والإيميل والرسالة) لو بعتها، ونسخة مُشفّرة (هاش) من عنوان الـ IP لمنع الإساءة. مش بنخزّن الـ IP نفسه.",
        "بنستخدمها عشان الرفيق يرد عليك، ونوصّل طلبك لمعاذ، ونحمي الموقع.",
        "اللي بيستلم بياناتك: مزوّد الـ AI اللي بيعالج رسائلك، وSupabase للتخزين، وتليجرام وخدمة إيميل لإشعار معاذ بطلبك.",
        "الرفيق مساعد AI مش إنسان، وملخص حوارك بيتبعت لمعاذ بس بعد موافقتك الصريحة.",
        "الاحتفاظ: الطلبات [180 يوم]. مفيش أدوات تتبع أو إعلانات.",
        "لطلب نسخة من بياناتك أو حذفها، تواصل معنا على moaz2009amen@gmail.com.",
      ],
    },
    license: {
      title: "حقوق الملكية",
      body: [
        "© 2026 معاذ، مؤسس AL MO Digital Solutions. جميع الحقوق محفوظة.",
        "مفيش إذن بنسخ أو تعديل أو إعادة نشر أي جزء من الموقع ده من غير موافقة كتابية من صاحبه.",
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy policy (draft)",
      body: [
        "This site is run by Moaz, founder of AL MO Digital Solutions.",
        "We collect: your messages to the companion, form data (name, email, message) if you send it, and a hashed copy of your IP address to prevent abuse. We don't store the IP itself.",
        "We use it so the companion can reply, to pass your request to Moaz, and to protect the site.",
        "Who receives your data: the AI provider that processes your messages, Supabase for storage, and Telegram and an email service to notify Moaz of your request.",
        "The companion is an AI assistant, not a human, and a summary of your chat is sent to Moaz only after your explicit consent.",
        "Retention: requests [180 days]. No tracking tools or ads.",
        "To request a copy of your data or its deletion, contact us at moaz2009amen@gmail.com.",
      ],
    },
    license: {
      title: "Ownership",
      body: [
        "© 2026 Moaz, founder of AL MO Digital Solutions. All rights reserved.",
        "No permission is granted to copy, modify or republish any part of this site without written consent from its owner.",
      ],
    },
  },
};
