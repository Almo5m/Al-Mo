import { useEffect, useState } from "react";
import { applyLang, DEFAULT_LANG, type Lang } from "./i18n";
import { LangContext } from "./i18n/LangContext";
import Loader from "./sections/Loader";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import About from "./sections/About";
import Process from "./sections/Process";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import SectionRail from "./components/SectionRail";

type Phase = "loading" | "leaving" | "done";
type Flip = "" | "out" | "in";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [flip, setFlip] = useState<Flip>("");
  useEffect(() => applyLang(DEFAULT_LANG), []);

  // الـ Hero بيبدأ يتحمّل (والجسيمات بتنطلق) بينما شاشة التحميل بتتلاشى
  function startLeaving() {
    setPhase("leaving");
    setTimeout(() => setPhase("done"), 450);
  }

  // تبديل اللغة بانعكاس الصفحة: بتلف لحد ما تختفي، نغيّر اللغة والاتجاه، وترجع تلف
  function switchLang(next: Lang) {
    if (next === lang) return;
    const apply = () => {
      applyLang(next); // الاتجاه لازم يتغيّر قبل ما المكوّنات تقيس أماكنها
      setLang(next);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    setFlip("out");
    setTimeout(() => {
      apply();
      setFlip("in");
      setTimeout(() => setFlip(""), 320);
    }, 230);
  }

  return (
    <LangContext.Provider value={lang}>
      <div className={`app ${flip ? `flip-${flip}` : ""}`}>
        {phase !== "loading" && (
          <>
            <Header onSwitchLang={switchLang} />
            <SectionRail />
            <main>
              <Hero />
              <Projects />
              <Skills />
              <About />
              <Process />
              <Testimonials />
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
