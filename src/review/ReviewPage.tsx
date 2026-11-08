import { useEffect, useState, type FormEvent } from "react";
import LogoMark from "../components/LogoMark";
import { callEdge, EdgeError } from "../lib/edge";
import "./ReviewPage.css";

type Lang = "ar" | "en";
type Phase = "checking" | "invalid" | "form" | "sending" | "done" | "offline" | "limit" | "error";

const TEXT: Record<Lang, Record<string, string>> = {
  ar: {
    brand: "AL MO Digital Solutions",
    title: "رأيك يهمنا",
    intro: "شكرًا إنك اشتغلت معانا. اكتب لنا رأيك بصراحة، وهنراجعه قبل ما يظهر.",
    project: "المشروع",
    name: "اسمك",
    role: "وظيفتك أو شركتك (اختياري)",
    rating: "تقييمك",
    text: "رأيك",
    textHint: "من 20 حرف لحد 1000",
    consent: "أوافق إن رأيي واسمي يظهروا للجميع في الموقع بعد المراجعة.",
    send: "إرسال",
    sending: "جاري الإرسال...",
    needFields: "اكتب اسمك وتقييمك ورأيك (20 حرف على الأقل) ووافق على العرض.",
    doneTitle: "شكرًا ليك",
    done: "وصل رأيك. هيظهر على الموقع بعد ما نراجعه.",
    invalid: "اللينك ده مش صالح أو انتهى أو اتستخدم قبل كده. اطلب لينك جديد منا.",
    offline: "الصفحة مش متاحة دلوقتي. جرّب تاني بعد شوية.",
    limit: "محاولات كتير. جرّب بعد شوية.",
    error: "حصلت مشكلة. جرّب تاني.",
    star: "نجمة",
  },
  en: {
    brand: "AL MO Digital Solutions",
    title: "Your feedback matters",
    intro: "Thanks for working with us. Tell us honestly what you think. We review it before it appears.",
    project: "Project",
    name: "Your name",
    role: "Your role or company (optional)",
    rating: "Your rating",
    text: "Your review",
    textHint: "20 to 1000 characters",
    consent: "I agree that my review and name are shown publicly on the site after review.",
    send: "Send",
    sending: "Sending...",
    needFields: "Enter your name, a rating, a review (at least 20 characters), and agree to the display.",
    doneTitle: "Thank you",
    done: "Your review was received. It will appear on the site after we review it.",
    invalid: "This link isn't valid, has expired, or was already used. Please ask us for a new one.",
    offline: "This page isn't available right now. Please try again later.",
    limit: "Too many attempts. Please try again later.",
    error: "Something went wrong. Please try again.",
    star: "star",
  },
};

// التوكن بيتقرا مرة واحدة وقت تحميل الملف (مش جوه الـ effect)، لأن React في وضع التطوير بيشغّل الـ effect مرتين
// والمرة الأولى بتشيل التوكن من الرابط.
const TOKEN_FROM_URL = new URLSearchParams(location.search).get("t") ?? "";

export default function ReviewPage() {
  const lang: Lang = document.documentElement.lang === "en" ? "en" : "ar";
  const t = TEXT[lang];
  const [token, setToken] = useState("");
  const [project, setProject] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [f, setF] = useState({ name: "", role: "", text: "", hp: "" });
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    document.title = `${t.title} | AL MO`;
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);

    // التوكن بيتشال من الرابط فورًا عشان ما يفضلش في سجل المتصفح أو لقطات الشاشة
    const tk = TOKEN_FROM_URL;
    history.replaceState(null, "", location.pathname);
    setToken(tk);
    if (!tk) {
      setPhase("invalid");
      return () => m.remove();
    }
    callEdge("review", { action: "check", token: tk })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        setProject(typeof data.project === "string" ? data.project : null);
        setPhase("form");
      })
      .catch((e: unknown) => {
        const kind = e instanceof EdgeError ? e.kind : "error";
        setPhase(kind === "invalid" ? "invalid" : kind === "limit" ? "limit" : kind === "offline" ? "offline" : "error");
      });
    return () => m.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (phase === "sending") return;
    if (!f.name.trim() || rating < 1 || f.text.trim().length < 20 || !consent) {
      setBad(true);
      return;
    }
    setBad(false);
    setPhase("sending");
    try {
      await callEdge("review", { action: "submit", token, name: f.name, role: f.role, text: f.text, rating, consent, lang, hp: f.hp });
      setPhase("done");
    } catch (err) {
      const kind = err instanceof EdgeError ? err.kind : "error";
      setPhase(kind === "invalid" ? "invalid" : kind === "limit" ? "limit" : kind === "offline" ? "offline" : "form");
      if (kind === "error") setBad(true);
    }
  }

  const message = phase === "invalid" || phase === "offline" || phase === "limit" || phase === "error" ? t[phase] : "";

  return (
    <main className="rv">
      <div className="rv-card">
        <div className="rv-brand">
          <LogoMark />
          <span data-no-scramble>{t.brand}</span>
        </div>

        {phase === "checking" && <p className="rv-note">…</p>}
        {message && <p className="rv-note" role="alert">{message}</p>}

        {phase === "done" && (
          <div className="rv-done">
            <h1>{t.doneTitle}</h1>
            <p>{t.done}</p>
          </div>
        )}

        {(phase === "form" || phase === "sending") && (
          <form onSubmit={submit} noValidate>
            <h1>{t.title}</h1>
            <p className="rv-intro">{t.intro}</p>
            {project && (
              <p className="rv-project">
                {t.project}: <strong>{project}</strong>
              </p>
            )}

            <label>
              <span>{t.name}</span>
              <input value={f.name} maxLength={80} autoComplete="name" onChange={(e) => setF({ ...f, name: e.target.value })} />
            </label>
            <label>
              <span>{t.role}</span>
              <input value={f.role} maxLength={120} onChange={(e) => setF({ ...f, role: e.target.value })} />
            </label>

            <fieldset>
              <legend>{t.rating}</legend>
              <div className="rv-stars" role="radiogroup" aria-label={t.rating}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} ${t.star}`}
                    className={n <= rating ? "on" : ""}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label>
              <span>
                {t.text} <small>{t.textHint}</small>
              </span>
              <textarea rows={6} value={f.text} maxLength={1000} onChange={(e) => setF({ ...f, text: e.target.value })} />
            </label>

            {/* فخ للبوتات: الإنسان مش بيشوفه ولا بيملاه */}
            <input className="rv-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} />

            <label className="rv-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t.consent}</span>
            </label>

            {bad && <p className="rv-note" role="alert">{t.needFields}</p>}
            <button type="submit" className="rv-send" disabled={phase === "sending"}>
              {phase === "sending" ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
