import { useCallback, useEffect, useState, type FormEvent } from "react";
import { sb } from "./supabase";
import { fmtDate } from "./ui";

type Status = "invited" | "pending" | "approved" | "hidden" | "rejected";
type Review = {
  id: string;
  created_at: string;
  label: string;
  project: string | null;
  expires_at: string;
  status: Status;
  author_name: string | null;
  author_role: string | null;
  body: string | null;
  display_body: string | null;
  rating: number | null;
  sort: number;
};

const STATUS: Record<Status, string> = {
  pending: "بيستنى مراجعتك",
  invited: "لينك مبعوت (لسه ما اتكتبش)",
  approved: "ظاهر في الموقع",
  hidden: "مخفي",
  rejected: "مرفوض",
};
const ORDER: Status[] = ["pending", "invited", "approved", "hidden", "rejected"];

const linkOf = (token: string) => `${location.origin}/review?t=${token}`;

function LinkBox({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = linkOf(token);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* المتصفح منع النسخ: اللينك ظاهر ينفع تنسخه بإيدك */
    }
  }
  return (
    <div className="ad-linkbox">
      <p className="ad-muted">اللينك ده بيظهر مرة واحدة بس. انسخه وابعته للعميل:</p>
      <code dir="ltr">{url}</code>
      <button type="button" className="ad-btn ad-primary" onClick={() => void copy()}>{copied ? "اتنسخ" : "نسخ"}</button>
    </div>
  );
}

function Card({ r, onSaved, onError }: { r: Review; onSaved: () => void; onError: (m: string) => void }) {
  const [name, setName] = useState(r.author_name ?? "");
  const [role, setRole] = useState(r.author_role ?? "");
  const [text, setText] = useState(r.display_body ?? r.body ?? "");
  const [sort, setSort] = useState(String(r.sort));
  const [token, setToken] = useState("");

  async function update(fields: Record<string, unknown>) {
    const { error } = await sb.from("reviews").update(fields).eq("id", r.id);
    if (error) onError("تعذّر الحفظ.");
    else onSaved();
  }
  // لو اتعدّل النص بنحفظه في display_body ونسيب الأصلي (body) زي ما العميل كتبه
  const edits = () => ({
    author_name: name.trim() || null,
    author_role: role.trim() || null,
    display_body: text.trim() && text.trim() !== (r.body ?? "").trim() ? text.trim() : null,
    sort: Number.isFinite(Number(sort)) ? Math.trunc(Number(sort)) : 0,
  });

  async function remove() {
    if (!window.confirm("حذف نهائي؟")) return;
    const { error } = await sb.from("reviews").delete().eq("id", r.id);
    if (error) onError("تعذّر الحذف.");
    else onSaved();
  }
  async function renew() {
    const { data, error } = await sb.rpc("regenerate_review_invite", { p_id: r.id, p_days: 14 });
    if (error || typeof data !== "string") onError("تعذّر تجديد اللينك.");
    else setToken(data);
  }

  if (r.status === "invited") {
    return (
      <article className="ad-card ad-item">
        <p>
          <strong>{r.label || "من غير اسم"}</strong>
          {r.project && <span className="ad-tag">{r.project}</span>}
        </p>
        <p className="ad-muted">ينتهي: {fmtDate(r.expires_at)}</p>
        {token && <LinkBox token={token} />}
        <div className="ad-range">
          <button type="button" className="ad-btn" onClick={() => void renew()}>تجديد اللينك (14 يوم)</button>
          <button type="button" className="ad-btn ad-danger" onClick={() => void remove()}>حذف</button>
        </div>
      </article>
    );
  }

  return (
    <article className="ad-card ad-item">
      <p>
        <strong>{r.label || r.author_name}</strong>
        {r.project && <span className="ad-tag">{r.project}</span>}
        {r.rating && <span className="ad-stars" aria-label={`${r.rating} من 5`}>{"★".repeat(r.rating)}</span>}
      </p>
      <p className="ad-muted">رأي العميل الأصلي:</p>
      <p className="ad-pre">{r.body}</p>

      <label>
        <span className="ad-muted">الاسم اللي هيظهر</span>
        <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        <span className="ad-muted">الوظيفة أو الشركة</span>
        <input value={role} maxLength={120} onChange={(e) => setRole(e.target.value)} />
      </label>
      <label>
        <span className="ad-muted">النص اللي هيظهر (لو عدّلته بيتحفظ منفصل عن الأصلي)</span>
        <textarea rows={4} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <label>
        <span className="ad-muted">الترتيب (الأكبر الأول)</span>
        <input dir="ltr" inputMode="numeric" value={sort} onChange={(e) => setSort(e.target.value)} />
      </label>

      <div className="ad-range">
        {r.status !== "approved" && (
          <button type="button" className="ad-btn ad-primary" onClick={() => void update({ ...edits(), status: "approved" })}>قبول</button>
        )}
        {r.status === "approved" && (
          <button type="button" className="ad-btn ad-primary" onClick={() => void update(edits())}>حفظ التعديلات</button>
        )}
        {r.status === "approved" && (
          <button type="button" className="ad-btn" onClick={() => void update({ status: "hidden" })}>إخفاء</button>
        )}
        {r.status !== "rejected" && r.status !== "approved" && (
          <button type="button" className="ad-btn" onClick={() => void update({ status: "rejected" })}>رفض</button>
        )}
        <button type="button" className="ad-btn ad-danger" onClick={() => void remove()}>حذف</button>
      </div>
    </article>
  );
}

export default function Reviews({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<Review[] | null>(null);
  const [err, setErr] = useState("");
  const [label, setLabel] = useState("");
  const [project, setProject] = useState("");
  const [days, setDays] = useState("14");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb
      .from("reviews")
      .select("id,created_at,label,project,expires_at,status,author_name,author_role,body,display_body,rating,sort")
      .order("created_at", { ascending: false });
    if (error) {
      setErr("تعذّر تحميل الآراء. تأكد إن ملف 0002_dashboard.sql اتشغّل.");
      return;
    }
    setErr("");
    setItems((data ?? []) as Review[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saved = () => {
    void load();
    onChange();
  };

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setToken("");
    const { data, error } = await sb.rpc("create_review_invite", { p_label: label.trim(), p_project: project.trim() || null, p_days: Number(days) });
    setBusy(false);
    if (error || typeof data !== "string") {
      setErr("تعذّر إنشاء اللينك.");
      return;
    }
    setErr("");
    setToken(data);
    setLabel("");
    setProject("");
    void load();
  }

  return (
    <div className="ad-stack">
      <form className="ad-card ad-stack" onSubmit={invite}>
        <h2>لينك تقييم جديد</h2>
        <label>
          <span className="ad-muted">اسم العميل (ليك بس، ما بيظهرش له)</span>
          <input value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} required />
        </label>
        <label>
          <span className="ad-muted">اسم المشروع (اختياري، بيظهر للعميل في صفحة التقييم)</span>
          <input value={project} maxLength={80} onChange={(e) => setProject(e.target.value)} />
        </label>
        <label>
          <span className="ad-muted">صلاحية اللينك</span>
          <select value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">7 أيام</option>
            <option value="14">14 يوم</option>
            <option value="30">30 يوم</option>
          </select>
        </label>
        <button type="submit" className="ad-btn ad-primary" disabled={busy}>{busy ? "..." : "إنشاء اللينك"}</button>
        {token && <LinkBox token={token} />}
      </form>

      {err && <p className="ad-err" role="alert">{err}</p>}
      {!items && !err && <p className="ad-muted">...</p>}
      {items && !items.length && <p className="ad-muted">لسه مفيش آراء.</p>}

      {items &&
        ORDER.map((st: Status) => {
          const group = items.filter((r: Review) => r.status === st);
          if (!group.length) return null;
          return (
            <section key={st} className="ad-stack">
              <h2>{STATUS[st]} ({group.length})</h2>
              {group.map((r: Review) => (
                <Card key={r.id} r={r} onSaved={saved} onError={setErr} />
              ))}
            </section>
          );
        })}
    </div>
  );
}
