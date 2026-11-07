import { useEffect, useRef, useState } from "react";
import { applyLang, detectLang, saveLang, type Lang } from "./i18n";
import { LangContext } from "./i18n/LangContext";
import { scrambleTexts } from "./lib/scramble";
import Loader from "./sections/Loader";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Companion from "./sections/Companion";
import Process from "./sections/Process";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import SectionRail from "./components/SectionRail";
import FloatingCompanion from "./components/FloatingCompanion";
import { SHOW_TESTIMONIALS } from "./i18n/sections";

type Phase = "loading" | "leaving" | "done";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lang, setLang] = useState<Lang>(detectLang);
  const [switching, setSwitching] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const scrambleNext = useRef(false);
  useEffect(() => applyLang(lang), []); // eslint-disable-line react-hooks/exhaustive-deps

  // بعد ما React يرسم النصوص بالغة الجديدة، الحروف بتتحوّل وتستقر
  useEffect(() => {
    if (!scrambleNext.current) return;
    scrambleNext.current = false;
    scrambleTexts(appRef.current, lang);
    setSwitching(false);
  }, [lang]);

  // الـ Hero بيبدأ يتحمّل (والجسيمات بتنطلق) بينما شاشة التحميل بتتلاشى
  function startLeaving() {
    setPhase("leaving");
    setTimeout(() => setPhase("done"), 450);
  }

  // تبديل اللغة: الصفحة بتخفت لحظة، اللغة والاتجاه بيتغيّروا، والحروف بتتحوّل لحد ما تستقر
  function switchLang(next: Lang) {
    if (next === lang) return;
    const apply = () => {
      applyLang(next); // الاتجاه لازم يتغيّر قبل ما المكوّنات تقيس أماكنها
      saveLang(next); // اختيار الزائر بيتحفظ وبيغلب لغة الجهاز
      setLang(next);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    setSwitching(true);
    setTimeout(() => {
      scrambleNext.current = true;
      apply();
    }, 160);
  }

  return (
    <LangContext.Provider value={lang}>
      <div ref={appRef} className={`app ${switching ? "switching" : ""}`}>
        {phase !== "loading" && (
          <>
            <Header onSwitchLang={switchLang} />
            <SectionRail />
            <FloatingCompanion />
            <main>
              <Hero />
              <Projects />
              <Companion />
              <Process />
              {SHOW_TESTIMONIALS && <Testimonials />}
              <Contact />
            </main>
            <Footer />
          </>
        )}
      </div>
      {phase !== "done" && <Loader onDone={startLeaving} leaving={phase === "leaving"} />}
    </LangContext.Provider>
  );
}
