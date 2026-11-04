import { useEffect, useRef, useState, type CSSProperties } from "react";
import Robot from "../components/Robot";
import { useLang } from "../i18n/LangContext";
import { PROCESS } from "../i18n/sections";
import "./Process.css";

// القسم طوله 4 شاشات والمحتوى ثابت جواه. التقدم (p) من 0 لـ 1 بيحرّك "الرفيق" بين الخطوات.
// TODO: العلامة الذهبية دي مكان الروبوت لحد ما الموديل يوصل.
export default function Process() {
  const t = PROCESS[useLang()];
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [walking, setWalking] = useState(false);
  const lastP = useRef(0);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let stopTimer = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const prog = total > 0 ? -el.getBoundingClientRect().top / total : 0;
      const clamped = Math.min(1, Math.max(0, prog));
      setP(clamped);
      // بيمشي لما السكرول بيتحرك، ويقف بعد لحظة من آخر حركة
      if (Math.abs(clamped - lastP.current) > 0.0004) {
        setWalking(true);
        clearTimeout(stopTimer);
        stopTimer = window.setTimeout(() => setWalking(false), 220);
      }
      lastP.current = clamped;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    calc();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stopTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const rtl = document.documentElement.dir === "rtl";
  const facing = walking ? (rtl ? -1 : 1) * (Math.PI / 2) : 0; // بيبص ناحية اتجاه المشي
  const n = t.steps.length;
  const active = Math.min(n - 1, Math.round(p * (n - 1)));

  if (reduced) {
    return (
      <section id="process" ref={ref} className="section process reduced">
        <h2>{t.title}</h2>
        <ol className="steps-list">
          {t.steps.map((s) => (
            <li key={s.title}>
              <b>{s.title}</b>
              {s.desc && <p>{s.desc}</p>}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="process" ref={ref} className="process" style={{ "--p": p } as CSSProperties}>
      <div className="stick">
        <h2>{t.title}</h2>
        <div className="track">
          <div className="line" />
          <div className="line-fill" />
          {t.steps.map((s, i) => (
            <span key={s.title} className={`node ${i <= active ? "on" : ""}`} style={{ insetInlineStart: `${(i / (n - 1)) * 100}%` }} />
          ))}
          <span className="marker" style={{ insetInlineStart: `${p * 100}%` }}>
            <Robot ambient={false} walking={walking} facing={facing} />
          </span>
        </div>
        <div className="bubble" key={active} aria-live="polite">
          <span className="step-no">{String(active + 1).padStart(2, "0")}</span>
          <h3>{t.steps[active].title}</h3>
          {t.steps[active].desc && <p>{t.steps[active].desc}</p>}
        </div>
      </div>
    </section>
  );
}
