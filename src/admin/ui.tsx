import type { CSSProperties } from "react";

export type KC = { k: string; c: number };

export const DEVICE: Record<string, string> = { mobile: "موبايل", tablet: "تابلت", desktop: "كمبيوتر", unknown: "غير معروف" };
export const LANG: Record<string, string> = { ar: "عربي", en: "English", unknown: "غير معروف" };
export const SECTION: Record<string, string> = {
  projects: "المشاريع",
  companion: "الرفيق",
  process: "طريقة الشغل",
  testimonials: "آراء العملاء",
  contact: "التواصل",
};
const ACTION: Record<string, string> = {
  demo: "فتح ديمو",
  channel: "ضغط على قناة",
  lang: "تغيير اللغة",
  chat: "بدأ محادثة مع الرفيق",
  handoff: "طلب من الرفيق",
  form: "فورم التواصل",
};

export const refLabel = (k: string): string =>
  k === "direct" ? "مباشر (من غير مصدر)" : k.startsWith("utm:") ? `لينك: ${k.slice(4)}` : k;

export const actionLabel = (k: string): string => {
  const [type, ...rest] = k.split(":");
  const name = rest.join(":");
  return `${ACTION[type] ?? type}${name ? ` · ${name}` : ""}`;
};

let regionNames: Intl.DisplayNames | null = null;
export const countryLabel = (code: string): string => {
  try {
    regionNames = regionNames ?? new Intl.DisplayNames(["ar"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

export function Rows({ items, label }: { items: KC[]; label: (k: string) => string }) {
  if (!items.length) return <p className="ad-muted">لسه مفيش بيانات.</p>;
  const max = Math.max(1, ...items.map((i) => i.c));
  return (
    <ul className="ad-rows">
      {items.map((i) => (
        <li key={i.k} style={{ "--w": `${(i.c / max) * 100}%` } as CSSProperties}>
          <span>{label(i.k)}</span>
          <b>{i.c}</b>
        </li>
      ))}
    </ul>
  );
}

export function BarChart({ data }: { data: { day: string; visitors: number }[] }) {
  const W = 600;
  const H = 140;
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const bw = W / Math.max(1, data.length);
  return (
    <div>
      <svg className="ad-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="الزيارات اليومية">
        {data.map((d, i) => {
          const h = (d.visitors / max) * (H - 6);
          return (
            <rect key={d.day} x={i * bw + 1} y={H - h} width={Math.max(1, bw - 2)} height={h}>
              <title>{`${d.day}: ${d.visitors}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="ad-chart-axis" dir="ltr">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
