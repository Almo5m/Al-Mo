import type { Lang } from "./index";

type HeaderText = {
  links: { id: string; label: string }[]; // الترتيب: الشغل أولًا
  contact: string;
  menu: string;
};

export const HEADER: Record<Lang, HeaderText> = {
  ar: {
    links: [
      { id: "projects", label: "المشاريع" },
      { id: "companion", label: "الرفيق" },
      { id: "process", label: "طريقة الشغل" },
      { id: "testimonials", label: "آراء العملاء" },
    ],
    contact: "تواصل",
    menu: "القائمة",
  },
  en: {
    links: [
      { id: "projects", label: "Projects" },
      { id: "companion", label: "Companion" },
      { id: "process", label: "How we work" },
      { id: "testimonials", label: "Testimonials" },
    ],
    contact: "Contact",
    menu: "Menu",
  },
};
