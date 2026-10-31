import type { CSSProperties } from "react";
import "./LogoAssemble.css";

// الشعار متقسّم لطبقات (حلقة، 3 أوجه، الاسم) كلها من نفس الصورة، وكل طبقة بتتحرك لوحدها.
// delay: بالملي ثانية قبل ما التركيب يبدأ.
export default function LogoAssemble({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="logo"
      style={{ "--d": `${delay}ms` } as CSSProperties}
      role="img"
      aria-label="AL MO Digital Solutions"
    >
      <div className="layer ring" />
      <div className="layer face top" />
      <div className="layer face left" />
      <div className="layer face right" />
      <div className="layer word" />
    </div>
  );
}
