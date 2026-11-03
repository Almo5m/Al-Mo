import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { askCompanion, sendHandoff, CompanionError, type Msg } from "../lib/companion";
import { useLang } from "../i18n/LangContext";
import { ABOUT } from "../i18n/about";
import "./CompanionChat.css";

type HStatus = "idle" | "sending" | "ok" | "invalid" | "limit" | "error" | "offline";

// حوار مفتوح مع الرفيق + زر "ابعت طلبي لمعاذ" بموافقة صريحة. الرسالة الأولى للعرض بس (مش بتتبعت للسيرفر).
export default function CompanionChat() {
  const t = ABOUT[useLang()];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [panel, setPanel] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hStatus, setHStatus] = useState<HStatus>("idle");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, note, hStatus]);

  async function send() {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setText("");
    setBusy(true);
    setNote("");
    try {
      const reply = await askCompanion(next);
      setMsgs([...next, { role: "assistant", content: reply || t.error }]);
    } catch (e) {
      const kind = e instanceof CompanionError ? e.kind : "error";
      setNote(kind === "offline" ? t.offline : kind === "limit" ? t.limit : t.error);
    } finally {
      setBusy(false);
    }
  }

  async function submitHandoff() {
    if (hStatus === "sending") return;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!name.trim() || !validEmail || !consent) {
      setHStatus("invalid");
      return;
    }
    setHStatus("sending");
    try {
      await sendHandoff(msgs, { name: name.trim(), email: email.trim() });
      setHStatus("ok");
      setPanel(false);
    } catch (e) {
      setHStatus(e instanceof CompanionError ? e.kind : "error");
    }
  }

  const handoffNote: Record<string, string> = {
    invalid: t.handoffInvalid,
    limit: t.limit,
    error: t.error,
    offline: t.offline,
  };

  return (
    <div className="chat">
      <p className="chat-title">{t.chatTitle}</p>
      <div ref={box} className="chat-log" role="log" aria-live="polite">
        <p className="msg bot">{t.opener}</p>
        {msgs.map((m, i) => (
          <p key={i} className={`msg ${m.role === "user" ? "me" : "bot"}`}>
            {m.content}
          </p>
        ))}
        {busy && <p className="msg bot dim">{t.thinking}</p>}
        {note && <p className="msg note">{note}</p>}
        {hStatus === "ok" && <p className="msg ok">{t.handoffOk}</p>}
      </div>

      {panel && hStatus !== "ok" && (
        <div className="handoff">
          <p className="handoff-title">{t.handoffTitle}</p>
          <input placeholder={t.yourName} aria-label={t.yourName} value={name} maxLength={80} autoComplete="name" onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
          <input type="email" dir="ltr" placeholder={t.yourEmail} aria-label={t.yourEmail} value={email} maxLength={254} autoComplete="email" onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
          <label className="consent">
            <input type="checkbox" checked={consent} onChange={(e: ChangeEvent<HTMLInputElement>) => setConsent(e.target.checked)} />
            <span>{t.consent}</span>
          </label>
          {handoffNote[hStatus] && <p className="msg note">{handoffNote[hStatus]}</p>}
          <div className="handoff-actions">
            <button type="button" className="primary" onClick={submitHandoff} disabled={hStatus === "sending"}>
              {hStatus === "sending" ? t.thinking : t.handoffSend}
            </button>
            <button type="button" onClick={() => setPanel(false)}>{t.cancel}</button>
          </div>
        </div>
      )}

      {!panel && hStatus !== "ok" && msgs.length > 0 && (
        <button type="button" className="handoff-btn" onClick={() => { setHStatus("idle"); setPanel(true); }}>
          {t.handoff}
        </button>
      )}

      <div className="chat-input">
        <span className="prompt" aria-hidden="true">&gt;</span>
        <input
          dir="auto"
          value={text}
          maxLength={500}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="button" onClick={send} disabled={busy || !text.trim()}>
          {t.send}
        </button>
      </div>
    </div>
  );
}
