import type { Lang } from "./index";

// المهارات وخطوات الشغل ورسالة الـ Footer بصوت معاذ (الترجمة الإنجليزي محتاجة مراجعته).
// لسه مؤقت: المشاريع والآراء.

// المهارات بصوت معاذ. icon = رقم الأيقونة المخصصة (SkillIcon).
export const SKILLS: Record<Lang, { title: string; hint: string; close: string; items: { name: string; detail: string; icon: number }[] }> = {
  ar: {
    title: "المهارات",
    hint: "اضغط على أي مهارة",
    close: "إغلاق",
    items: [
      { name: "Python", detail: "عندي أساس قوي في Python.", icon: 3 },
      { name: "Supabase", detail: "عندي خبرة مع Supabase.", icon: 1 },
      { name: "Vercel", detail: "عندي خبرة مع Vercel.", icon: 2 },
      { name: "React · Next.js · Vite", detail: "عندي مشاريع بيهم وفاهمهم، بس مش خبير فيهم قوي.", icon: 0 },
    ],
  },
  en: {
    title: "Skills",
    hint: "Tap any skill",
    close: "Close",
    items: [
      { name: "Python", detail: "I have a strong foundation in Python.", icon: 3 },
      { name: "Supabase", detail: "I have hands-on experience with Supabase.", icon: 1 },
      { name: "Vercel", detail: "I have hands-on experience with Vercel.", icon: 2 },
      { name: "React · Next.js · Vite", detail: "I've built projects with them and understand them well, but I'm not an expert yet.", icon: 0 },
    ],
  },
};

// بيانات المشاريع (مش نصوص): التقنيات ولينك الديمو. لينك فاضي = "الديمو قريبًا".
export const PROJECTS_DATA: { id: string; tags: string[]; demoUrl: string }[] = [
  { id: "p1", tags: ["React", "Supabase"], demoUrl: "" },
  { id: "p2", tags: ["Python", "MCP"], demoUrl: "" },
  { id: "p3", tags: ["Flutter"], demoUrl: "" },
];

export const PROJECTS: Record<Lang, {
  title: string; demo: string; soon: string; impact: string; preview: string;
  minimize: string; restore: string; newTab: string; close: string;
  items: { title: string; desc: string; impact: string }[];
}> = {
  ar: {
    title: "المشاريع",
    demo: "جرّب الديمو",
    soon: "الديمو قريبًا",
    impact: "الأثر",
    preview: "معاينة",
    minimize: "تصغير",
    restore: "رجّع الديمو",
    newTab: "افتح في تبويب جديد",
    close: "إغلاق",
    items: [
      { title: "[اسم المشروع 1]", desc: "[وصف قصير للمشروع]", impact: "[الأثر أو النتيجة]" },
      { title: "[اسم المشروع 2]", desc: "[وصف قصير للمشروع]", impact: "[الأثر أو النتيجة]" },
      { title: "[اسم المشروع 3]", desc: "[وصف قصير للمشروع]", impact: "[الأثر أو النتيجة]" },
    ],
  },
  en: {
    title: "Projects",
    demo: "Try the demo",
    soon: "Demo coming soon",
    impact: "Impact",
    preview: "Preview",
    minimize: "Minimize",
    restore: "Restore demo",
    newTab: "Open in a new tab",
    close: "Close",
    items: [
      { title: "[Project 1 name]", desc: "[Short project description]", impact: "[Impact or result]" },
      { title: "[Project 2 name]", desc: "[Short project description]", impact: "[Impact or result]" },
      { title: "[Project 3 name]", desc: "[Short project description]", impact: "[Impact or result]" },
    ],
  },
};

export const PROCESS: Record<Lang, { title: string; companion: string; steps: { title: string; desc: string }[] }> = {
  ar: {
    title: "طريقة الشغل",
    companion: "الرفيق",
    steps: [
      { title: "نفهم المطلوب من العميل", desc: "" },
      { title: "نحدد المطلوب مننا", desc: "" },
      { title: "نحدد المطلوب من العميل", desc: "" },
      { title: "نحط ميعاد تسليم", desc: "" },
      { title: "نسلّم في الميعاد", desc: "" },
      { title: "نتابع حسب الاتفاق", desc: "" },
    ],
  },
  en: {
    title: "How we work",
    companion: "Companion",
    steps: [
      { title: "We understand what the client needs", desc: "" },
      { title: "We define what's required from us", desc: "" },
      { title: "We define what's required from the client", desc: "" },
      { title: "We set a delivery date", desc: "" },
      { title: "We deliver on time", desc: "" },
      { title: "We follow up as agreed", desc: "" },
    ],
  },
};

export const TESTIMONIALS: Record<Lang, { title: string; items: { text: string; who: string }[] }> = {
  ar: {
    title: "آراء العملاء",
    items: [
      { text: "[رأي حقيقي من عميل هيتحط هنا]", who: "[الاسم]" },
      { text: "[رأي حقيقي من عميل هيتحط هنا]", who: "[الاسم]" },
      { text: "[رأي حقيقي من عميل هيتحط هنا]", who: "[الاسم]" },
    ],
  },
  en: {
    title: "Testimonials",
    items: [
      { text: "[A real client testimonial goes here]", who: "[Name]" },
      { text: "[A real client testimonial goes here]", who: "[Name]" },
      { text: "[A real client testimonial goes here]", who: "[Name]" },
    ],
  },
};

export const CONTACT: Record<Lang, {
  title: string; name: string; email: string; message: string; send: string; sending: string;
  companion: string; ok: string; invalid: string; limit: string; error: string; offline: string;
  orTalk: string; talk: string; whatsapp: string; telegram: string; mail: string; soon: string;
}> = {
  ar: {
    title: "تواصل معانا",
    name: "الاسم",
    email: "الإيميل",
    message: "رسالتك",
    send: "إرسال",
    sending: "بيتبعت...",
    companion: "الرفيق",
    ok: "وصلت رسالتك لمعاذ. هيرد عليك قريب.",
    invalid: "راجع البيانات: الاسم والإيميل والرسالة كلهم لازم يتملّوا.",
    limit: "بعتّ رسايل كتير. جرّب بعد شوية.",
    error: "حصلت مشكلة وماتبعتتش. جرّب تاني.",
    offline: "الفورم لسه مش متوصّل بالسيرفر (وضع تجريبي).",
    orTalk: "أو كلّم الرفيق",
    talk: "افتح الحوار",
    whatsapp: "واتساب",
    telegram: "تليجرام",
    mail: "إيميل",
    soon: "قريبًا",
  },
  en: {
    title: "Get in touch",
    name: "Name",
    email: "Email",
    message: "Your message",
    send: "Send",
    sending: "sending...",
    companion: "Companion",
    ok: "Your message reached Moaz. He'll reply soon.",
    invalid: "Check the fields: name, email and message are all required.",
    limit: "You sent too many messages. Try again in a bit.",
    error: "Something went wrong and it wasn't sent. Try again.",
    offline: "The form isn't connected to the server yet (demo mode).",
    orTalk: "Or talk to the companion",
    talk: "Open the chat",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    mail: "Email",
    soon: "soon",
  },
};

export const FOOTER: Record<Lang, {
  closing: string; sections: string; channels: string; legal: string; privacy: string; license: string; rights: string; home: string;
}> = {
  ar: {
    closing: "فخورين جدًا إن احنا جزء من تجربتك، ودايمًا بنحاول نقدّم أحسن ما عندنا علشان مصلحة العميل.",
    sections: "الأقسام",
    channels: "القنوات",
    legal: "قانوني",
    privacy: "الخصوصية",
    license: "حقوق الملكية",
    rights: "© 2026 معاذ · AL MO Digital Solutions",
    home: "الرئيسية",
  },
  en: {
    closing: "We're proud to be part of your experience, and we always try to give our best for the client's benefit.",
    sections: "Sections",
    channels: "Channels",
    legal: "Legal",
    privacy: "Privacy",
    license: "Ownership",
    rights: "© 2026 Moaz · AL MO Digital Solutions",
    home: "Home",
  },
};
