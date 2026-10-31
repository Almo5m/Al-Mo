import { useEffect, type MouseEvent } from "react";
import { useLang } from "../i18n/LangContext";
import { LEGAL, type LegalDoc } from "../i18n/legal";
import "./LegalModal.css";

// نافذة منبثقة زجاجية بتظهر بضبابية لوضوح. Esc أو الضغط بره بيقفلها.
export default function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const lang = useLang();
  const d = LEGAL[lang][doc];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={d.title} onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <h3>{d.title}</h3>
        {d.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <button type="button" className="modal-close" onClick={onClose} autoFocus>
          {lang === "ar" ? "إغلاق" : "Close"}
        </button>
      </div>
    </div>
  );
}
