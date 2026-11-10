import { useCallback, useEffect, useState, type FormEvent } from "react";
import { sb } from "./supabase";

type Row = {
  id: string;
  slug: string;
  sort: number;
  visible: boolean;
  tags: string[];
  demo_url: string | null;
  preview_url: string | null;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  impact_ar: string;
  impact_en: string;
};

type Form = {
  slug: string;
  sort: string;
  visible: boolean;
  tags: string;
  demo_url: string;
  preview_url: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  impact_ar: string;
  impact_en: string;
};

const SLUG = /^[a-z0-9][a-z0-9-]{0,38}$/;
const HTTPS = /^https:\/\/\S{3,250}$/; // نفس حد قاعدة البيانات (PostgreSQL مبيقبلش تكرار أكبر من 255)
const PREVIEW = /^(\/projects\/[A-Za-z0-9._/-]{1,120}|https:\/\/\S{3,250})$/;
const BUCKET = "project-previews";

const emptyForm = (sort: number): Form => ({
  slug: "", sort: String(sort), visible: true, tags: "", demo_url: "", preview_url: "",
  title_ar: "", title_en: "", desc_ar: "", desc_en: "", impact_ar: "", impact_en: "",
});

const toForm = (r: Row): Form => ({
  slug: r.slug, sort: String(r.sort), visible: r.visible, tags: r.tags.join(", "),
  demo_url: r.demo_url ?? "", preview_url: r.preview_url ?? "",
  title_ar: r.title_ar, title_en: r.title_en, desc_ar: r.desc_ar, desc_en: r.desc_en,
  impact_ar: r.impact_ar, impact_en: r.impact_en,
});

// بيصغّر الصورة لعرض 1280 بالكتير ويحوّلها WebP عشان تبقى خفيفة (الـ bucket حده 1MB)
async function toWebp(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const w = Math.min(1280, bmp.width);
  const h = Math.round(bmp.height * (w / bmp.width));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
  if (!blob) throw new Error("encode");
  return blob;
}

function validate(f: Form): { error: string } | { payload: Record<string, unknown> } {
  const slug = f.slug.trim();
  if (!SLUG.test(slug)) return { error: "المعرّف (slug): حروف إنجليزي صغيرة وأرقام وشرطة بس، يبدأ بحرف أو رقم، لحد 39 حرف." };
  if (!f.title_ar.trim() || !f.title_en.trim()) return { error: "اكتب اسم المشروع بالعربي والإنجليزي." };
  const demo = f.demo_url.trim();
  if (demo && !HTTPS.test(demo)) return { error: "رابط الديمو لازم يبدأ بـ https://" };
  const preview = f.preview_url.trim();
  if (preview && !PREVIEW.test(preview)) return { error: "رابط الصورة لازم https:// أو مسار يبدأ بـ /projects/" };
  const tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.length > 8 || tags.some((t) => t.length > 30)) return { error: "التقنيات: 8 كحد أقصى، وكل واحدة لحد 30 حرف." };
  const sort = Number(f.sort);
  return {
    payload: {
      slug, sort: Number.isFinite(sort) ? Math.trunc(sort) : 0, visible: f.visible, tags,
      demo_url: demo || null, preview_url: preview || null,
      title_ar: f.title_ar.trim(), title_en: f.title_en.trim(),
      desc_ar: f.desc_ar.trim(), desc_en: f.desc_en.trim(),
      impact_ar: f.impact_ar.trim(), impact_en: f.impact_en.trim(),
    },
  };
}

function Editor({ id, initial, onDone, onCancel }: { id: string | null; initial: Form; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (v: string | boolean) => setF({ ...f, [k]: v });

  async function upload(file: File | undefined) {
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      const blob = await toWebp(file);
      const path = `${f.slug.trim() || "project"}-${Date.now()}.webp`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      setF((cur: Form) => ({ ...cur, preview_url: data.publicUrl }));
    } catch {
      setErr("تعذّر رفع الصورة. تأكد إنها صورة (JPG أو PNG أو WebP) وإن ملف 0003_content.sql اتشغّل.");
    }
    setBusy(false);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const v = validate(f);
    if ("error" in v) {
      setErr(v.error);
      return;
    }
    setBusy(true);
    setErr("");
    const { error } = id ? await sb.from("projects").update(v.payload).eq("id", id) : await sb.from("projects").insert(v.payload);
    setBusy(false);
    if (error) setErr(error.code === "23505" ? "المعرّف (slug) مستخدم في مشروع تاني." : "تعذّر الحفظ. راجع الحقول.");
    else onDone();
  }

  const field = (label: string, k: keyof Form, opts?: { dir?: "ltr"; rows?: number; max?: number; hint?: string }) => (
    <label>
      <span className="ad-muted">{label}</span>
      {opts?.rows ? (
        <textarea rows={opts.rows} maxLength={opts.max} value={f[k] as string} onChange={(e) => set(k)(e.target.value)} />
      ) : (
        <input dir={opts?.dir} maxLength={opts?.max} value={f[k] as string} onChange={(e) => set(k)(e.target.value)} />
      )}
      {opts?.hint && <span className="ad-muted">{opts.hint}</span>}
    </label>
  );

  return (
    <form className="ad-card ad-stack" onSubmit={save}>
      <h2>{id ? "تعديل مشروع" : "مشروع جديد"}</h2>
      {field("المعرّف (slug): بيتستخدم في الإحصائيات", "slug", { dir: "ltr", max: 39 })}
      {field("الاسم بالعربي", "title_ar", { max: 120 })}
      {field("الاسم بالإنجليزي", "title_en", { dir: "ltr", max: 120 })}
      {field("الوصف بالعربي", "desc_ar", { rows: 3, max: 600 })}
      {field("الوصف بالإنجليزي", "desc_en", { rows: 3, max: 600 })}
      {field("الأثر بالعربي (حاجة حقيقية تقدر تثبتها)", "impact_ar", { rows: 2, max: 400 })}
      {field("الأثر بالإنجليزي", "impact_en", { rows: 2, max: 400 })}
      {field("التقنيات (بينها فاصلة)", "tags", { dir: "ltr", hint: "مثال: React, Supabase, PWA" })}
      {field("رابط الديمو (https)", "demo_url", {
        dir: "ltr",
        hint: "لو الديمو على دومين جديد لازم يتضاف في frame-src في vercel.json، وإلا المتصفح هيحجب النافذة.",
      })}

      <div className="ad-stack">
        <span className="ad-muted">صورة المعاينة</span>
        {f.preview_url && <img className="ad-thumb" src={f.preview_url} alt="معاينة المشروع" />}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void upload(e.target.files?.[0])} disabled={busy} />
        {field("أو رابط الصورة", "preview_url", { dir: "ltr" })}
      </div>

      {field("الترتيب (الأصغر الأول)", "sort", { dir: "ltr" })}
      <label className="ad-check">
        <input type="checkbox" checked={f.visible} onChange={(e) => set("visible")(e.target.checked)} />
        <span>ظاهر في الموقع</span>
      </label>

      {err && <p className="ad-err" role="alert">{err}</p>}
      <div className="ad-range">
        <button type="submit" className="ad-btn ad-primary" disabled={busy}>{busy ? "..." : "حفظ"}</button>
        <button type="button" className="ad-btn" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

export default function Projects() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await sb.from("projects").select("*").order("sort", { ascending: true }).order("created_at", { ascending: true });
    if (error) {
      setErr("تعذّر تحميل المشاريع. تأكد إن ملف 0003_content.sql اتشغّل.");
      return;
    }
    setErr("");
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setVisible(r: Row, visible: boolean) {
    const { error } = await sb.from("projects").update({ visible }).eq("id", r.id);
    if (error) setErr("تعذّر الحفظ.");
    else void load();
  }

  // ترتيب جديد: بنعيد ترقيم الكل (10، 20، 30...) ونحدّث اللي اتغيّر بس
  async function move(i: number, dir: -1 | 1) {
    if (!rows) return;
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    const changed = next.map((r: Row, idx: number) => ({ r, sort: (idx + 1) * 10 })).filter((x: { r: Row; sort: number }) => x.r.sort !== x.sort);
    const results = await Promise.all(changed.map((x: { r: Row; sort: number }) => sb.from("projects").update({ sort: x.sort }).eq("id", x.r.id)));
    if (results.some((x: { error: unknown }) => x.error)) setErr("تعذّر تغيير الترتيب.");
    void load();
  }

  async function remove(r: Row) {
    if (!window.confirm(`حذف "${r.title_ar}" نهائيًا؟`)) return;
    const { error } = await sb.from("projects").delete().eq("id", r.id);
    if (error) setErr("تعذّر الحذف.");
    else void load();
  }

  if (editing) {
    return (
      <Editor
        id={editing.id}
        initial={editing.form}
        onCancel={() => setEditing(null)}
        onDone={() => {
          setEditing(null);
          void load();
        }}
      />
    );
  }

  const nextSort = (rows?.reduce((m: number, r: Row) => Math.max(m, r.sort), 0) ?? 0) + 10;

  return (
    <div className="ad-stack">
      <div className="ad-range">
        <button type="button" className="ad-btn ad-primary" onClick={() => setEditing({ id: null, form: emptyForm(nextSort) })}>مشروع جديد</button>
      </div>
      {err && <p className="ad-err" role="alert">{err}</p>}
      {!rows && !err && <p className="ad-muted">...</p>}
      {rows && !rows.length && <p className="ad-muted">مفيش مشاريع. الموقع مش هيعرض قسم المشاريع.</p>}
      {rows?.map((r: Row, i: number) => (
        <article key={r.id} className="ad-card ad-item">
          <p>
            <strong>{r.title_ar}</strong>
            <span className="ad-tag">{r.slug}</span>
            {!r.visible && <span className="ad-tag">مخفي</span>}
          </p>
          <p className="ad-muted">{r.tags.join(" · ")}</p>
          <div className="ad-range">
            <button type="button" className="ad-btn" onClick={() => setEditing({ id: r.id, form: toForm(r) })}>تعديل</button>
            <button type="button" className="ad-btn" onClick={() => void setVisible(r, !r.visible)}>{r.visible ? "إخفاء" : "إظهار"}</button>
            <button type="button" className="ad-btn" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="لفوق">↑</button>
            <button type="button" className="ad-btn" onClick={() => void move(i, 1)} disabled={i === rows.length - 1} aria-label="لتحت">↓</button>
            <button type="button" className="ad-btn ad-danger" onClick={() => void remove(r)}>حذف</button>
          </div>
        </article>
      ))}
    </div>
  );
}
