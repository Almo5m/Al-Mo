import { useEffect, useRef, useState } from "react";
import LogoAssemble from "../components/LogoAssemble";
import "./Loader.css";

const MIN_MS = 3600; // مدة تركيب الشعار (شوف LogoAssemble.css). الشاشة ما بتخلصش قبلها حتى لو النت سريع
const HOLD_MS = 400; // وقفة بعد ما الشعار يكتمل، يعني الإجمالي 4 ثواني

// الخط الرفيع تحت الشعار حقيقي: كل مهمة تحميل بتخلص بتزوّد النسبة. الإيقاع بس هو اللي بيتبطّأ لحد الحد الأدنى.
function loadTasks(): { tasks: Promise<unknown>[]; logo: Promise<void> } {
  const font = (spec: string, text: string) => document.fonts.load(spec, text).catch(() => undefined);
  const logo = new Promise<void>((res) => {
    const img = new Image();
    img.onload = img.onerror = () => res();
    img.src = "/logo-full.webp";
    window.setTimeout(res, 2000); // لو الصورة اتأخرت نكمّل برضو
  });
  const page = new Promise<void>((res) => {
    if (document.readyState === "complete") res();
    else window.addEventListener("load", () => res(), { once: true });
  });
  return {
    logo,
    tasks: [
      font("700 56px Cairo", "مشروع Project"),
      font("500 56px 'Space Grotesk'", "Project 0123"),
      font("400 20px 'IBM Plex Sans Arabic'", "بنبني we build"),
      logo,
      page,
    ],
  };
}

// الشاشة بتظهر لكل زائر كل مرة. الاستثناء الوحيد: اللي مفعّل "تقليل الحركة" في جهازه.
function shouldSkip(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Loader({ onDone, leaving = false }: { onDone: () => void; leaving?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(false);
  const [play, setPlay] = useState(false); // الحركة بتبدأ بعد ما صورة الشعار تتحمّل

  const finish = () => onDone();

  useEffect(() => {
    if (shouldSkip()) {
      onDone();
      return;
    }
    const { tasks, logo } = loadTasks();
    let done = 0;
    tasks.forEach((p) => p.then(() => done++, () => done++));

    let shown = 0;
    let raf = 0;
    let hold = 0;
    let ended = false;
    let cancelled = false;
    let t0 = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / MIN_MS);
      const paced = t * t * (3 - 2 * t); // بداية ونهاية ناعمة
      const target = Math.min(done / tasks.length, paced);
      shown += (target - shown) * 0.15;
      if (target >= 1 && shown > 0.995) shown = 1;

      rootRef.current?.style.setProperty("--p", shown.toFixed(4));

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

    logo.then(() => {
      if (cancelled) return;
      setPlay(true);
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className={`loader ${complete ? "complete" : ""} ${leaving ? "leaving" : ""}`}>
      <LogoAssemble play={play} />
      <div className="meter" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
