import type { Lang } from "./index";

export type LegalDoc = "privacy" | "license";

// TODO: مسودة لازم تتراجع قبل النشر. نفس محتوى PRIVACY.md و LICENSE.
export const LEGAL: Record<Lang, Record<LegalDoc, { title: string; body: string[] }>> = {
  ar: {
    privacy: {
      title: "سياسة الخصوصية (مسودة)",
      body: [
        "الموقع بتديره AL MO Digital Solutions.",
        "بنجمع: رسائلك للرفيق، وبيانات الفورم (الاسم والإيميل والرسالة) لو بعتها، ونسخة مُشفّرة (هاش) من عنوان الـ IP لمنع الإساءة. مش بنخزّن الـ IP نفسه.",
        "بنستخدمها عشان الرفيق يرد عليك، ونستلم طلبك ونرد عليك، ونحمي الموقع.",
        "اللي بيستلم بياناتك: مزوّد الـ AI اللي بيعالج رسائلك، وSupabase للتخزين، وتليجرام وخدمة إيميل لإشعارنا بطلبك. وكمان Vercel لاستضافة الموقع، وGoogle Fonts لتحميل الخطوط، وGitHub Pages للديمو (لما تفتحه بس)، وده بيخليهم يشوفوا عنوان الـ IP بتاعك زي أي موقع بتزوره.",
        "الرفيق مساعد AI مش إنسان، وملخص حوارك بيوصلنا بس بعد موافقتك الصريحة.",
        "الاحتفاظ: الطلبات [180 يوم]. مفيش أدوات تتبع أو إعلانات.",
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
        "We collect: your messages to the companion, form data (name, email, message) if you send it, and a hashed copy of your IP address to prevent abuse. We don't store the IP itself.",
        "We use it so the companion can reply, to receive your request and reply to you, and to protect the site.",
        "Who receives your data: the AI provider that processes your messages, Supabase for storage, and Telegram and an email service to notify us of your request. Also Vercel for hosting, Google Fonts for loading fonts, and GitHub Pages for the demo (only when you open it), which means they can see your IP address like any site you visit.",
        "The companion is an AI assistant, not a human, and a summary of your chat is sent to us only after your explicit consent.",
        "Retention: requests [180 days]. No tracking tools or ads.",
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
