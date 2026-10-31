import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { askCompanion, CompanionError, type Msg } from "../lib/companion";
import { useLang } from "../i18n/LangContext";
import { ABOUT } from "../i18n/about";
import "./CompanionChat.css";

// حوار مفتوح مع الرفيق. الرسالة الأولى للعرض بس (مش بتتبعت للسيرفر).
export default function CompanionChat() {
  const t = ABOUT[useLang()];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, note]);

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
      </div>
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
