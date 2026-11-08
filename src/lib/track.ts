// تتبع الزيارات من غير كوكيز ومن غير بيانات شخصية (الدالة track على Supabase، وشرحها في docs/admin-dashboard.md).
// بيحترم "Do Not Track" و"Global Privacy Control"، ومش بيتتبع على localhost.
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// لو اتحط في المتصفح ده، الزيارات منه ما بتتعدش (زرار في إعدادات اللوحة)
export const NO_TRACK_KEY = "almo_no_track";

export type TrackType = "view" | "section" | "demo" | "channel" | "chat" | "handoff" | "form" | "lang";

function optedOut(): boolean {
  try {
    if (localStorage.getItem(NO_TRACK_KEY) === "1") return true;
  } catch {
    /* التخزين مش متاح: نكمّل عادي */
  }
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (n.doNotTrack === "1" || n.globalPrivacyControl === true) return true;
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

// مصدر الزيارة: ?utm_source=... أو ?ref=... (مفيد للينكات اللي بتبعتها)، وإلا دومين الموقع المُحيل. الدومين بس من غير مسار.
function source(): string {
  const q = new URLSearchParams(location.search);
  const tag = q.get("utm_source") ?? q.get("ref");
  if (tag && /^[a-z0-9_.-]{1,40}$/i.test(tag)) return `utm:${tag.toLowerCase()}`;
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (host && host !== location.hostname) return host.slice(0, 80);
  } catch {
    /* مفيش referrer */
  }
  return "";
}

const sent = new Set<string>(); // كل حدث بيتبعت مرة واحدة في كل تحميل للصفحة

export function track(type: TrackType, name = ""): void {
  if (!URL_ || !KEY || optedOut()) return;
  const id = `${type}:${name}`;
  if (sent.has(id)) return;
  sent.add(id);
  const body: Record<string, string> = { type, name, lang: document.documentElement.lang === "en" ? "en" : "ar" };
  if (type === "view") body.ref = source();
  fetch(`${URL_}/functions/v1/track`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
    body: JSON.stringify(body),
  }).catch(() => {
    /* التتبع ما يعطّلش الموقع أبدًا */
  });
}
