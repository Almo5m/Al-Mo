import { useState, type ChangeEvent, type FormEvent } from "react";
import SparkBox from "../components/SparkBox";
import CompanionBubble from "../components/CompanionBubble";
import Reveal from "../components/Reveal";
import { useLang } from "../i18n/LangContext";
import { CONTACT } from "../i18n/sections";
import { CONTACT_LINKS } from "../config";
import { ContactError, sendContact } from "../lib/contact";
import { robotDo } from "../lib/robotBus";
import "./Contact.css";

type Status = "idle" | "sending" | "ok" | "invalid" | "limit" | "error" | "offline";

export default function Contact() {
  const t = CONTACT[useLang()];
  const [f, setF] = useState({ name: "", email: "", message: "", hp: "" });
  const [status, setStatus] = useState<Status>("idle");

  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!f.name.trim() || !f.email.trim() || !f.message.trim()) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    robotDo("Think");
    try {
      await sendContact(f);
      setStatus("ok");
      robotDo("Success");
      setF({ name: "", email: "", message: "", hp: "" });
    } catch (err) {
      setStatus(err instanceof ContactError ? err.kind : "error");
      robotDo("Error");
    }
  }

  const channel = (label: string, href: string) =>
    href ? (
      <a className="channel" href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    ) : (
      <span className="channel off" aria-disabled="true">
        {label} · {t.soon}
      </span>
    );

  return (
    <section id="contact" className="section contact">
      <h2>{t.title}</h2>
      <div className="contact-grid">
        <Reveal>
          <form className="form" onSubmit={submit} noValidate>
            <SparkBox className="field">
              <label>
                <span className="prompt" aria-hidden="true">&gt;</span>
                <input placeholder={t.name} aria-label={t.name} value={f.name} maxLength={80} autoComplete="name" onChange={set("name")} />
              </label>
            </SparkBox>
            <SparkBox className="field">
              <label>
                <span className="prompt" aria-hidden="true">&gt;</span>
                <input type="email" dir="ltr" placeholder={t.email} aria-label={t.email} value={f.email} maxLength={254} autoComplete="email" onChange={set("email")} />
              </label>
            </SparkBox>
            <SparkBox className="field">
              <label>
                <span className="prompt" aria-hidden="true">&gt;</span>
                <textarea rows={4} placeholder={t.message} aria-label={t.message} value={f.message} maxLength={2000} onChange={set("message")} />
              </label>
            </SparkBox>
            {/* فخ للبوتات: الإنسان مش بيشوفه ولا بيملاه */}
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={set("hp")} />
            <button type="submit" className="send" disabled={status === "sending"}>
              {status === "sending" ? t.sending : t.send}
            </button>
            {status !== "idle" && status !== "sending" && (
              <CompanionBubble who={t.companion} kind={status === "ok" ? "ok" : "error"} text={t[status]} />
            )}
          </form>
        </Reveal>

        <Reveal delay={150}>
          <aside className="side">
            <div className="channels">
              {channel(t.whatsapp, CONTACT_LINKS.whatsapp)}
              {channel(t.telegram, CONTACT_LINKS.telegram)}
              {channel(t.mail, CONTACT_LINKS.email)}
            </div>
            <div className="companion-card">
              <p>{t.orTalk}</p>
              <a href="#companion" className="channel">{t.talk}</a>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
