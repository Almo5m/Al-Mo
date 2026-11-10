import { useEffect, useState, type FormEvent } from "react";
import { sb } from "./supabase";

type Form = {
  whatsapp: string;
  telegram: string;
  email: string;
  companion: boolean;
  process: boolean;
  floatEnabled: boolean;
  bubbleEnabled: boolean;
  bubbleAr: string;
  bubbleEn: string;
};

const LINK = /^((https:\/\/|mailto:)\S{1,250})?$/; // نفس حد قاعدة البيانات

const DEFAULTS: Form = {
  whatsapp: "", telegram: "", email: "", companion: true, process: true,
  floatEnabled: true, bubbleEnabled: true, bubbleAr: "", bubbleEn: "",
};

const obj = (x: unknown): Record<string, unknown> => (typeof x === "object" && x !== null ? (x as Record<string, unknown>) : {});

export default function SiteSettings() {
  const [f, setF] = useState<Form | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await sb.from("site_settings").select("key,value");
      if (error) {
        setErr("تعذّر تحميل الإعدادات. تأكد إن ملف 0003_content.sql اتشغّل.");
        return;
      }
      const m: Record<string, Record<string, unknown>> = {};
      for (const r of (data ?? []) as { key: string; value: unknown }[]) m[r.key] = obj(r.value);
      const cl = m.contact_links ?? {};
      const sec = m.sections ?? {};
      const fl = m.floating ?? {};
      setF({
        whatsapp: typeof cl.whatsapp === "string" ? cl.whatsapp : "",
        telegram: typeof cl.telegram === "string" ? cl.telegram : "",
        email: typeof cl.email === "string" ? cl.email : "",
        companion: sec.companion !== false,
        process: sec.process !== false,
        floatEnabled: fl.enabled !== false,
        bubbleEnabled: fl.bubble_enabled !== false,
        bubbleAr: typeof fl.bubble_ar === "string" ? fl.bubble_ar : "",
        bubbleEn: typeof fl.bubble_en === "string" ? fl.bubble_en : "",
      });
    })();
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f || busy) return;
    setMsg("");
    const links = [f.whatsapp, f.telegram, f.email].map((x: string) => x.trim());
    if (links.some((x: string) => !LINK.test(x))) {
      setErr("الروابط لازم تبدأ بـ https:// (أو mailto: للإيميل)، أو تسيبها فاضية.");
      return;
    }
    setErr("");
    setBusy(true);
    const { error } = await sb.from("site_settings").upsert(
      [
        { key: "contact_links", value: { whatsapp: links[0], telegram: links[1], email: links[2] } },
        { key: "sections", value: { companion: f.companion, process: f.process } },
        {
          key: "floating",
          value: { enabled: f.floatEnabled, bubble_enabled: f.bubbleEnabled, bubble_ar: f.bubbleAr.trim(), bubble_en: f.bubbleEn.trim() },
        },
      ],
      { onConflict: "key" }
    );
    setBusy(false);
    if (error) setErr("تعذّر الحفظ. راجع الحقول.");
    else setMsg("اتحفظ. بيظهر في الموقع عند أي زيارة جديدة.");
  }

  if (!f) return err ? <p className="ad-err" role="alert">{err}</p> : <p className="ad-muted">...</p>;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF({ ...f, [k]: v });

  return (
    <form className="ad-stack" onSubmit={save}>
      <div className="ad-card ad-stack">
        <h2>روابط التواصل</h2>
        <p className="ad-muted">لو سبت حقل فاضي الموقع بيستخدم الرابط الأصلي اللي في الكود.</p>
        <label>
          <span className="ad-muted">واتساب</span>
          <input dir="ltr" placeholder="https://wa.me/20..." value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </label>
        <label>
          <span className="ad-muted">تليجرام</span>
          <input dir="ltr" placeholder="https://t.me/..." value={f.telegram} onChange={(e) => set("telegram", e.target.value)} />
        </label>
        <label>
          <span className="ad-muted">الإيميل</span>
          <input dir="ltr" placeholder="mailto:name@example.com" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </label>
      </div>

      <div className="ad-card ad-stack">
        <h2>الأقسام</h2>
        <p className="ad-muted">المشاريع تختفي لو ما فيش مشروع ظاهر، والآراء تظهر لوحدها لما يبقى فيه رأي مقبول.</p>
        <label className="ad-check">
          <input type="checkbox" checked={f.companion} onChange={(e) => set("companion", e.target.checked)} />
          <span>قسم الرفيق (الحوار)</span>
        </label>
        <label className="ad-check">
          <input type="checkbox" checked={f.process} onChange={(e) => set("process", e.target.checked)} />
          <span>قسم طريقة الشغل</span>
        </label>
      </div>

      <div className="ad-card ad-stack">
        <h2>زرار الرفيق العائم</h2>
        <label className="ad-check">
          <input type="checkbox" checked={f.floatEnabled} onChange={(e) => set("floatEnabled", e.target.checked)} />
          <span>ظاهر في الموقع</span>
        </label>
        <label className="ad-check">
          <input type="checkbox" checked={f.bubbleEnabled} onChange={(e) => set("bubbleEnabled", e.target.checked)} />
          <span>فقاعة الكلام بتظهر مرة للزائر</span>
        </label>
        <label>
          <span className="ad-muted">نص الفقاعة بالعربي (فاضي = النص الأصلي)</span>
          <input maxLength={120} value={f.bubbleAr} onChange={(e) => set("bubbleAr", e.target.value)} />
        </label>
        <label>
          <span className="ad-muted">نص الفقاعة بالإنجليزي</span>
          <input dir="ltr" maxLength={120} value={f.bubbleEn} onChange={(e) => set("bubbleEn", e.target.value)} />
        </label>
      </div>

      {err && <p className="ad-err" role="alert">{err}</p>}
      {msg && <p className="ad-muted" role="status">{msg}</p>}
      <div className="ad-range">
        <button type="submit" className="ad-btn ad-primary" disabled={busy}>{busy ? "..." : "حفظ الإعدادات"}</button>
        <button type="button" className="ad-btn" onClick={() => setF(DEFAULTS)}>رجّع القيم الأصلية</button>
      </div>
    </form>
  );
}
