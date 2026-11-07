import type { Lang } from "./index";
import { SHOW_TESTIMONIALS } from "./sections";

type HeaderText = {
  links: { id: string; label: string }[]; // الترتيب: الشغل أولًا
  contact: string;
  menu: string;
};

// رابط الآراء بيظهر بس لما يكون فيه آراء حقيقية (شوف TESTIMONIALS في sections.ts)
const visible = (links: { id: string; label: string }[]) => links.filter((l) => l.id !== "testimonials" || SHOW_TESTIMONIALS);

export const HEADER: Record<Lang, HeaderText> = {
  ar: {
    links: visible([
      { id: "projects", label: "المشاريع" },
      { id: "companion", label: "الرفيق" },
      { id: "process", label: "طريقة الشغل" },
      { id: "testimonials", label: "آراء العملاء" },
    ]),
    contact: "تواصل",
    menu: "القائمة",
  },
  en: {
    links: visible([
      { id: "projects", label: "Projects" },
      { id: "companion", label: "Companion" },
      { id: "process", label: "How we work" },
      { id: "testimonials", label: "Testimonials" },
    ]),
    contact: "Contact",
    menu: "Menu",
  },
};
