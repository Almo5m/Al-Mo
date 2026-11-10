import { useSyncExternalStore } from "react";
import type { Lang } from "../i18n";
import { PROJECTS, PROJECTS_DATA } from "../i18n/sections";
import { CONTACT_LINKS } from "../config";

// محتوى الموقع اللي بيتحكم فيه الأدمن من اللوحة (المشاريع، روابط التواصل، تشغيل الأقسام، الزرار العائم).
// القيم اللي في الكود هي الاحتياطي: لو الطلب فشل أو الإعداد فاضي، الموقع بيشتغل بيها زي ما كان.
// وكل حاجة جاية من برّه بتتنضّف هنا قبل ما تتعرض (الروابط https أو mailto بس).
export type Localized = Record<Lang, string>;

export type SiteProject = {
  id: string;
  tags: string[];
  demoUrl: string;
  preview: string;
  title: Localized;
  desc: Localized;
  impact: Localized;
};

export type Content = {
  projects: SiteProject[];
  contactLinks: { whatsapp: string; telegram: string; email: string };
  sections: { companion: boolean; process: boolean };
  floating: { enabled: boolean; bubbleEnabled: boolean; bubble: Partial<Localized> };
};

const DEFAULT_PROJECTS: SiteProject[] = PROJECTS_DATA.map((p, i) => ({
  id: p.id,
  tags: p.tags,
  demoUrl: p.demoUrl,
  preview: p.preview,
  title: { ar: PROJECTS.ar.items[i].title, en: PROJECTS.en.items[i].title },
  desc: { ar: PROJECTS.ar.items[i].desc, en: PROJECTS.en.items[i].desc },
  impact: { ar: PROJECTS.ar.items[i].impact, en: PROJECTS.en.items[i].impact },
}));

let state: Content = {
  projects: DEFAULT_PROJECTS,
  contactLinks: { ...CONTACT_LINKS },
  sections: { companion: true, process: true },
  floating: { enabled: true, bubbleEnabled: true, bubble: {} },
};
const listeners = new Set<() => void>();

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);
const str = (x: unknown, max: number): string => (typeof x === "string" ? x.slice(0, max) : "");

const link = (x: unknown): string => {
  const s = str(x, 300).trim();
  return /^(https:\/\/|mailto:)\S+$/i.test(s) ? s : "";
};
const demo = (x: unknown): string => {
  const s = str(x, 300).trim();
  return /^https:\/\/\S+$/i.test(s) ? s : "";
};
const preview = (x: unknown): string => {
  const s = str(x, 300).trim();
  return /^(\/projects\/[A-Za-z0-9._/-]+|https:\/\/\S+)$/.test(s) ? s : "";
};

function parseProject(x: unknown): SiteProject | null {
  if (!isObj(x)) return null;
  const id = str(x.id, 40);
  const titleAr = str(x.title_ar, 120);
  const titleEn = str(x.title_en, 120);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !titleAr || !titleEn) return null;
  const tags = Array.isArray(x.tags) ? x.tags.map((t) => str(t, 30).trim()).filter(Boolean).slice(0, 8) : [];
  return {
    id,
    tags,
    demoUrl: demo(x.demo_url),
    preview: preview(x.preview_url),
    title: { ar: titleAr, en: titleEn },
    desc: { ar: str(x.desc_ar, 600), en: str(x.desc_en, 600) },
    impact: { ar: str(x.impact_ar, 400), en: str(x.impact_en, 400) },
  };
}

export async function loadContent(): Promise<void> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_site_content`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return; // الدالة لسه مش متضافة: الموقع بيكمّل بالقيم اللي في الكود
    const data: unknown = await res.json();
    if (!isObj(data) || !Array.isArray(data.projects)) return;

    const s = isObj(data.settings) ? data.settings : {};
    const cl = isObj(s.contact_links) ? s.contact_links : {};
    const sec = isObj(s.sections) ? s.sections : {};
    const fl = isObj(s.floating) ? s.floating : {};
    const bubbleAr = str(fl.bubble_ar, 120).trim();
    const bubbleEn = str(fl.bubble_en, 120).trim();

    state = {
      projects: data.projects.map(parseProject).filter((p): p is SiteProject => p !== null),
      contactLinks: {
        whatsapp: link(cl.whatsapp) || CONTACT_LINKS.whatsapp,
        telegram: link(cl.telegram) || CONTACT_LINKS.telegram,
        email: link(cl.email) || CONTACT_LINKS.email,
      },
      sections: { companion: sec.companion !== false, process: sec.process !== false },
      floating: {
        enabled: fl.enabled !== false,
        bubbleEnabled: fl.bubble_enabled !== false,
        bubble: { ...(bubbleAr && { ar: bubbleAr }), ...(bubbleEn && { en: bubbleEn }) },
      },
    };
    listeners.forEach((l) => l());
  } catch {
    /* من غير اتصال: الموقع بيشتغل بالقيم اللي في الكود */
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useContent = (): Content => useSyncExternalStore(subscribe, () => state);
