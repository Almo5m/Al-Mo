import type { Lang } from "./index";

type HeroText = {
  headline: string;
  services: string[]; // السطر المتغيّر
  primary: string;
  secondary: string;
};

export const HERO: Record<Lang, HeroText> = {
  ar: {
    headline: "احنا مش بنقدم خدمة، احنا بنقدم فكرة كلنا جزء منها.",
    services: ["بنبني مواقع", "بنطوّر أنظمة إدارة", "بنبني تطبيقات موبايل", "بنأتمت شغلك بأدوات AI"],
    primary: "شوف المشاريع",
    secondary: "تواصل",
  },
  en: {
    headline: "We don't offer a service. We offer an idea we're all part of.",
    services: ["we build websites", "we develop management systems", "we build mobile apps", "we automate with AI tools"],
    primary: "See the work",
    secondary: "Contact",
  },
};
