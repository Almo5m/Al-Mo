import { useState } from "react";
import LegalModal from "../components/LegalModal";
import { useLang } from "../i18n/LangContext";
import { HEADER } from "../i18n/header";
import { useNavLinks } from "../i18n/useNav";
import { CONTACT, FOOTER } from "../i18n/sections";
import type { LegalDoc } from "../i18n/legal";
import { useContent } from "../lib/content";
import { track } from "../lib/track";
import "./Footer.css";

export default function Footer() {
  const lang = useLang();
  const t = FOOTER[lang];
  const h = HEADER[lang];
  const c = CONTACT[lang];
  const navLinks = useNavLinks();
  const { contactLinks: CONTACT_LINKS } = useContent();
  const [doc, setDoc] = useState<LegalDoc | null>(null);

  const channel = (label: string, href: string, key: string) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => track("channel", key)}>{label}</a>
    ) : (
      <span className="off">{label}</span>
    );

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="closing-col">
          <img className="footer-logo" src="/logo-full.webp" alt="AL MO Digital Solutions" width="96" height="96" loading="lazy" />
          <p className="closing">{t.closing}</p>
        </div>

        <nav aria-label={t.sections}>
          <h4>{t.sections}</h4>
          <a href="#top">{t.home}</a>
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`}>{l.label}</a>
          ))}
          <a href="#contact">{h.contact}</a>
        </nav>

        <div>
          <h4>{t.channels}</h4>
          {channel(c.whatsapp, CONTACT_LINKS.whatsapp, "whatsapp")}
          {channel(c.telegram, CONTACT_LINKS.telegram, "telegram")}
          {channel(c.mail, CONTACT_LINKS.email, "email")}
        </div>

        <div>
          <h4>{t.legal}</h4>
          <button type="button" onClick={() => setDoc("privacy")}>{t.privacy}</button>
          <button type="button" onClick={() => setDoc("license")}>{t.license}</button>
        </div>
      </div>
      <p className="rights">{t.rights}</p>
      {doc && <LegalModal doc={doc} onClose={() => setDoc(null)} />}
    </footer>
  );
}
