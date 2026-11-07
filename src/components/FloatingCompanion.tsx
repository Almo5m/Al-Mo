import { useEffect, useRef, useState } from "react";
import Robot from "./Robot";
import { useLang } from "../i18n/LangContext";
import { COMPANION } from "../i18n/companion";
import "./FloatingCompanion.css";

const SEEN = "almo_bubble"; // الفقاعة بتظهر مرة واحدة في الجلسة

// الرفيق كزر عائم للتواصل: بيظهر بعد الـ Hero، وبيختفي لما الحوار أو الفورم يبقوا قدام الزائر.
// الضغط عليه بيوصّل الزائر لقسم الحوار ويركّز على خانة الكتابة.
export default function FloatingCompanion() {
  const t = COMPANION[useLang()];
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false); // الروبوت بيتحمّل أول مرة الزر يظهر بس
  const [bubble, setBubble] = useState(false);
  const heroIn = useRef(true);
  const chatIn = useRef(new Set<Element>());

  useEffect(() => {
    const update = () => setShow(!heroIn.current && chatIn.current.size === 0);

    const hero = document.getElementById("top");
    const ioHero = new IntersectionObserver(
      ([e]) => {
        heroIn.current = e.intersectionRatio >= 0.35;
        update();
      },
      { threshold: [0, 0.35] }
    );
    if (hero) ioHero.observe(hero);
    else heroIn.current = false;

    const ioChat = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? chatIn.current.add(e.target) : chatIn.current.delete(e.target)));
        update();
      },
      { threshold: [0, 0.1] }
    );
    ["companion", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) ioChat.observe(el);
    });

    return () => {
      ioHero.disconnect();
      ioChat.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!show) {
      setBubble(false);
      return;
    }
    setMounted(true);
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {
      /* التخزين مش متاح: الفقاعة هتظهر عادي */
    }
    if (seen) return;
    const a = window.setTimeout(() => {
      setBubble(true);
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {
        /* مش مشكلة */
      }
    }, 1500);
    const b = window.setTimeout(() => setBubble(false), 8500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [show]);

  function open() {
    setBubble(false);
    const section = document.getElementById("companion");
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => section.querySelector<HTMLElement>(".chat-input input")?.focus({ preventScroll: true }), reduce ? 0 : 700);
  }

  return (
    <div className={`float-companion ${show ? "on" : ""}`} aria-hidden={!show}>
      {bubble && (
        <div className="float-bubble" role="status">
          {t.floatHint}
        </div>
      )}
      <button type="button" className="float-btn" onClick={open} aria-label={t.chatTitle} tabIndex={show ? 0 : -1}>
        {mounted && <Robot portrait ambient={false} lookAtCursor />}
      </button>
    </div>
  );
}
