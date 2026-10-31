import { useEffect, useRef, useState } from "react";
import LogoProgress from "../components/LogoProgress";
import "./Loader.css";

const MIN_MS = 3500; // أقل مدة قبل ما العدّاد يوصل 100 (حتى لو النت سريع)
const HOLD_MS = 500; // وقفة بعد 100، يعني الإجمالي 4 ثواني

// الرقم حقيقي: كل مهمة بتخلص بتزوّد النسبة. الإيقاع بس هو اللي بيتبطّأ لحد الحد الأدنى.
function loadTasks(): Promise<unknown>[] {
  const font = (spec: string, text: string) => document.fonts.load(spec, text).catch(() => undefined);
  const logo = new Promise<void>((res) => {
    const img = new Image();
    img.onload = img.onerror = () => res();
    img.src = "/logo-almo.png";
  });
  const page = new Promise<void>((res) => {
    if (document.readyState === "complete") res();
    else window.addEventListener("load", () => res(), { once: true });
  });
  return [
    font("700 56px Cairo", "مشروع Project"),
    font("500 56px 'Space Grotesk'", "Project 0123"),
    font("400 20px 'IBM Plex Sans Arabic'", "بنبني we build"),
    logo,
    page,
  ];
}

// الشاشة بتظهر لكل زائر كل مرة. الاستثناء الوحيد: اللي مفعّل "تقليل الحركة" في جهازه.
function shouldSkip(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Loader({ onDone, leaving = false }: { onDone: () => void; leaving?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [complete, setComplete] = useState(false);

  const finish = () => onDone();

  useEffect(() => {
    if (shouldSkip()) {
      onDone();
      return;
    }
    const tasks = loadTasks();
    let done = 0;
    tasks.forEach((p) => p.then(() => done++, () => done++));

    const t0 = performance.now();
    let shown = 0;
    let raf = 0;
    let hold = 0;
    let ended = false;

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / MIN_MS);
      const paced = t * t * (3 - 2 * t); // بداية ونهاية ناعمة
      const target = Math.min(done / tasks.length, paced);
      shown += (target - shown) * 0.15;
      if (target >= 1 && shown > 0.995) shown = 1;

      rootRef.current?.style.setProperty("--p", shown.toFixed(4));
      if (countRef.current) countRef.current.textContent = String(Math.round(shown * 100)).padStart(2, "0");

      if (shown >= 1) {
        if (!ended) {
          ended = true;
          setComplete(true);
          hold = window.setTimeout(finish, HOLD_MS);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className={`loader ${complete ? "complete" : ""} ${leaving ? "leaving" : ""}`}>
      <LogoProgress />
      <div className="meter" dir="ltr">
        <span className="count">
          <span ref={countRef}>00</span>
          <i>%</i>
        </span>
        <div className="bar">
          <span />
        </div>
      </div>
    </div>
  );
}
