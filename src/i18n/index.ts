// لغة الموقع: اختيار الزائر المحفوظ، وإلا حسب لغة جهازه (عربي لو الجهاز عربي، غير كده إنجليزي).
export type Lang = "ar" | "en";
export const DEFAULT_LANG: Lang = "en";
const KEY = "almo_lang";

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    /* التخزين ممكن يكون مقفول */
  }
  const device = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
  return device.startsWith("ar") ? "ar" : "en";
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* عادي */
  }
}

export function applyLang(lang: Lang): void {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
}
