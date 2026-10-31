// اللغة الأساسية إنجليزي. التبديل بيعكس اتجاه الصفحة كلها.
export type Lang = "ar" | "en";
export const DEFAULT_LANG: Lang = "en";

export function applyLang(lang: Lang): void {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
}
