import { useEffect, useState } from "react";
import LangSwitch from "../components/LangSwitch";
import LogoMark from "../components/LogoMark";
import { useLang } from "../i18n/LangContext";
import { HEADER } from "../i18n/header";
import type { Lang } from "../i18n";
import "./Header.css";

export default function Header({ onSwitchLang }: { onSwitchLang: (l: Lang) => void }) {
  const lang = useLang();
  const t = HEADER[lang];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const links = t.links.map((l) => (
    <a key={l.id} href={`#${l.id}`} onClick={close}>
      {l.label}
    </a>
  ));

  return (
    <header className="hdr">
      <div className="hdr-in">
        <a className="brand" href="#top" aria-label="AL MO">
          <LogoMark />
          <span className="brand-text" data-no-scramble>AL MO</span>
        </a>

        <nav className="nav" aria-label="main">
          {links}
        </nav>

        <div className="actions">
          <LangSwitch lang={lang} onSwitch={onSwitchLang} />
          <a className="cta" href="#contact">
            {t.contact}
          </a>
        </div>

        <button
          type="button"
          className={`burger ${open ? "open" : ""}`}
          aria-label={t.menu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && <div className="scrim" onClick={close} />}
      <div id="mobile-menu" className={`menu ${open ? "open" : ""}`}>
        <nav aria-label="mobile">{links}</nav>
        <div className="menu-actions">
          <LangSwitch lang={lang} onSwitch={onSwitchLang} />
          <a className="cta" href="#contact" onClick={close}>
            {t.contact}
          </a>
        </div>
      </div>
    </header>
  );
}
