import type { Lang } from "../i18n";

// مفتاح تبديل اللغة: نقطة ذهبية بتنزلق بين "ع" و"EN"
export default function LangSwitch({ lang, onSwitch }: { lang: Lang; onSwitch: (l: Lang) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={lang === "en"}
      aria-label="العربية / English"
      className={`lang ${lang}`}
      dir="ltr"
      data-no-scramble
      onClick={() => onSwitch(lang === "ar" ? "en" : "ar")}
    >
      <span className="lang-lbl">ع</span>
      <span className="lang-track">
        <i className="lang-dot" />
      </span>
      <span className="lang-lbl">EN</span>
    </button>
  );
}
