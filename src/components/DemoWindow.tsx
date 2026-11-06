import { useEffect, useState } from "react";
import "./DemoWindow.css";

type Props = {
  title: string;
  url: string;
  labels: { minimize: string; restore: string; newTab: string; close: string };
  onClose: () => void;
};

// نافذة الديمو العائمة: تصغير لأيقونة، فتح في تبويب جديد، إغلاق. على الموبايل بتفتح ملء الشاشة.
export default function DemoWindow({ title, url, labels, onClose }: Props) {
  const [mini, setMini] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className={`demo ${mini ? "mini" : ""}`} role="dialog" aria-label={title}>
        <div className="demo-bar">
          <span className="demo-title">{title}</span>
          <div className="demo-tools">
            <button type="button" aria-label={labels.minimize} onClick={() => setMini(true)}>_</button>
            <button type="button" aria-label={labels.newTab} onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>↗</button>
            <button type="button" aria-label={labels.close} onClick={onClose}>×</button>
          </div>
        </div>
        {/* الديمو لازم يتستضاف على دومين مختلف ببيانات تجريبية بس. allow-downloads و allow-modals عشان تصدير Excel وطباعة الفاتورة شغالين جواه. */}
        <iframe
          src={url}
          title={title}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads allow-modals"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      {mini && (
        <button type="button" className="demo-mini" aria-label={labels.restore} onClick={() => setMini(false)}>
          {title.charAt(0)}
        </button>
      )}
    </>
  );
}
