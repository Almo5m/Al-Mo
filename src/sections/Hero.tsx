import { useEffect, useState } from "react";
import ParticleHeadline from "../components/ParticleHeadline";
import ParticleButton from "../components/ParticleButton";
import Robot from "../components/Robot";
import { HERO } from "../i18n/hero";
import { useLang } from "../i18n/LangContext";
import "./Hero.css";

// السطر اللي بيبدّل الخدمات بتلاشي ضبابي كل 2.5 ثانية
function RotatingLine({ lines }: { lines: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), 2500);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <p className="rot" aria-live="off">
      <span key={i}>{lines[i]}</span>
    </p>
  );
}

export default function Hero() {
  const lang = useLang();
  const t = HERO[lang];

  return (
    <section id="top" className="hero">
      <div className="hero-text">
        <ParticleHeadline text={t.headline} />
        <RotatingLine lines={t.services} />
        <div className="hero-cta">
          <ParticleButton href="#projects" variant="primary">{t.primary}</ParticleButton>
          <ParticleButton href="#contact" variant="secondary">{t.secondary}</ParticleButton>
        </div>
      </div>
      <div className="hero-visual">
        <Robot lookAtCursor greet listen interactive scrollHint />
      </div>
    </section>
  );
}
