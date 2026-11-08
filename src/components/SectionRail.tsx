import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLang } from "../i18n/LangContext";
import { HEADER } from "../i18n/header";
import { useNavLinks } from "../i18n/useNav";
import { FOOTER } from "../i18n/sections";
import "./SectionRail.css";

// كمبيوتر وتابلت: نقاط أقسام جانبية بتلمع عند القسم الحالي. موبايل: خط تقدم رفيع.
export default function SectionRail() {
  const lang = useLang();
  // نفس ترتيب روابط القائمة، فلو قسم اتشال أو اتضاف بيتعدّل هنا لوحده
  const navLinks = useNavLinks();
  const IDS = ["top", ...navLinks.map((l) => l.id), "contact"];
  const idsKey = IDS.join(",");
  const labels = [FOOTER[lang].home, ...navLinks.map((l) => l.label), HEADER[lang].contact];
  const [active, setActive] = useState("top");
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--p", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <nav className="rail" aria-label="sections">
        {IDS.map((id, i) => (
          <a key={id} href={`#${id}`} data-label={labels[i]} aria-label={labels[i]} className={active === id ? "on" : ""} />
        ))}
      </nav>
      <div ref={bar} className="progress" style={{ "--p": 0 } as CSSProperties} aria-hidden="true" />
    </>
  );
}
