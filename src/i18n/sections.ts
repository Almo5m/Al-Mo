import type { Lang } from "./index";

// خطوات الشغل ورسالة الـ Footer والتواصل (الترجمة الإنجليزي محتاجة مراجعة).
// لسه مؤقت: الآراء.

// بيانات المشاريع (مش نصوص): التقنيات ولينك الديمو. لينك فاضي = "الديمو قريبًا".
// preview = مسار لقطة الشاشة في public/projects (1280 عرض webp تقريبًا)، وفاضي = مكان المعاينة الافتراضي.
// المشروع الجديد بيتضاف هنا (id جديد + تقنياته + لينك الديمو + لقطته) ونصوصه في PROJECTS تحت بنفس الترتيب.
export const PROJECTS_DATA: { id: string; tags: string[]; demoUrl: string; preview: string }[] = [
  { id: "spare-parts", tags: ["React", "TypeScript", "Supabase", "PWA"], demoUrl: "https://almo5m.github.io/spare-parts-demo/", preview: "/projects/spare-parts.webp" },
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
      {
        title: "نظام إدارة مخزن قطع غيار السيارات",
        desc: "نظام لإدارة المخزون والمبيعات والمشتريات: فواتير بيع من أكتر من مخزن، طلبيات شراء، مرتجعات، جرد، وكشوف حساب للعملاء.",
        impact: "أرباح دقيقة مش تقريبية: كل عملية شراء بتتسجل كدفعة لوحدها والبيع بيسحب من أقدم دفعة (FIFO)، فبتعرف ربح كل قطعة بالظبط.",
      },
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
      {
        title: "Auto spare parts inventory system",
        desc: "A system for managing stock, sales and purchasing: multi-warehouse sales invoices, purchase orders, returns, stocktaking, and customer statements.",
        impact: "Accurate profit, not estimates: every purchase is tracked as its own lot and sales draw from the oldest lot first (FIFO), so the profit on each item is exact.",
      },
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

// آراء العملاء: ضيف هنا آراء حقيقية بس (النص والاسم). طول ما القايمة فاضية، القسم ورابطه في القائمة والمؤشر الجانبي والفوتر مخفيين تمامًا.
// الشكل: { text: "...", who: "..." }، وبنفس الترتيب في العربي والإنجليزي.
export const TESTIMONIALS: Record<Lang, { title: string; items: { text: string; who: string }[] }> = {
  ar: { title: "آراء العملاء", items: [] },
  en: { title: "Testimonials", items: [] },
};
export const SHOW_TESTIMONIALS = TESTIMONIALS.ar.items.length > 0;

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
    ok: "وصلت رسالتك. هنرد عليك قريب.",
    invalid: "راجع البيانات: الاسم والإيميل والرسالة كلهم لازم يتملّوا.",
    limit: "بعتّ رسايل كتير. جرّب بعد شوية.",
    error: "حصلت مشكلة وماتبعتتش. جرّب تاني.",
    offline: "الفورم مش شغال دلوقتي. تقدر تكلّمنا مباشرة من قنوات التواصل.",
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
    ok: "Your message was received. We'll reply soon.",
    invalid: "Check the fields: name, email and message are all required.",
    limit: "You sent too many messages. Try again in a bit.",
    error: "Something went wrong and it wasn't sent. Try again.",
    offline: "The form isn't working right now. You can reach us directly through the contact channels.",
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
    rights: "© 2026 AL MO Digital Solutions",
    home: "الرئيسية",
  },
  en: {
    closing: "We're proud to be part of your experience, and we always try to give our best for the client's benefit.",
    sections: "Sections",
    channels: "Channels",
    legal: "Legal",
    privacy: "Privacy",
    license: "Ownership",
    rights: "© 2026 AL MO Digital Solutions",
    home: "Home",
  },
};
