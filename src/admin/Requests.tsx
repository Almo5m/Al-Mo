import { useCallback, useEffect, useState } from "react";
import { sb } from "./supabase";
import { fmtDate } from "./ui";

type Status = "new" | "read" | "replied" | "archived";
type Req = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  summary: string;
  source: string;
  status: Status;
  note: string | null;
};

const STATUS: Record<Status, string> = { new: "جديد", read: "اتقرا", replied: "اتردّ عليه", archived: "مؤرشف" };
const SOURCE: Record<string, string> = { form: "الفورم", companion: "الرفيق" };

export default function Requests({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<Req[] | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await sb
      .from("contact_requests")
      .select("id,created_at,name,email,summary,source,status,note")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      setErr("تعذّر تحميل الطلبات.");
      return;
    }
    setErr("");
    setItems((data ?? []) as Req[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, fields: { status?: Status; note?: string | null }) {
    const { error } = await sb.from("contact_requests").update(fields).eq("id", id);
    if (error) {
      setErr("تعذّر الحفظ.");
      return;
    }
    setErr("");
    setItems((prev) => (prev ? prev.map((r: Req) => (r.id === id ? { ...r, ...fields } : r)) : prev));
    onChange();
  }

  async function remove(id: string) {
    if (!window.confirm("حذف الطلب نهائيًا؟")) return;
    const { error } = await sb.from("contact_requests").delete().eq("id", id);
    if (error) {
      setErr("تعذّر الحذف.");
      return;
    }
    setItems((prev) => (prev ? prev.filter((r: Req) => r.id !== id) : prev));
    setOpen(null);
    onChange();
  }

  function toggle(r: Req) {
    const next = open === r.id ? null : r.id;
    setOpen(next);
    if (next && r.status === "new") void patch(r.id, { status: "read" });
  }

  if (!items) return err ? <p className="ad-err" role="alert">{err}</p> : <p className="ad-muted">...</p>;
  const shown = filter === "all" ? items : items.filter((r: Req) => r.status === filter);

  return (
    <div className="ad-stack">
      <div className="ad-range" role="group" aria-label="الحالة">
        {(["all", "new", "read", "replied", "archived"] as const).map((k) => (
          <button key={k} type="button" className={`ad-btn ${k === filter ? "ad-on" : ""}`} onClick={() => setFilter(k)}>
            {k === "all" ? "الكل" : STATUS[k]}
          </button>
        ))}
        <button type="button" className="ad-btn" onClick={() => void load()}>تحديث</button>
      </div>
      {err && <p className="ad-err" role="alert">{err}</p>}
      {!shown.length && <p className="ad-muted">مفيش طلبات هنا.</p>}

      {shown.map((r: Req) => (
        <article key={r.id} className={`ad-card ad-item ${r.status === "new" ? "ad-new" : ""}`}>
          <button type="button" className="ad-item-head" onClick={() => toggle(r)} aria-expanded={open === r.id}>
            <strong>{r.name}</strong>
            <span className="ad-tag">{SOURCE[r.source] ?? r.source}</span>
            <span className="ad-tag">{STATUS[r.status]}</span>
            <span className="ad-muted">{fmtDate(r.created_at)}</span>
          </button>
          {open !== r.id && <p className="ad-snippet">{r.summary.slice(0, 140)}</p>}
          {open === r.id && (
            <div className="ad-stack">
              <p className="ad-pre">{r.summary}</p>
              <p>
                <a href={`mailto:${r.email}`} dir="ltr">{r.email}</a>
              </p>
              <div className="ad-range">
                {(["new", "read", "replied", "archived"] as const).map((k) => (
                  <button key={k} type="button" className={`ad-btn ${r.status === k ? "ad-on" : ""}`} onClick={() => void patch(r.id, { status: k })}>
                    {STATUS[k]}
                  </button>
                ))}
              </div>
              <label>
                <span className="ad-muted">ملاحظتك (ليك بس)</span>
                <textarea rows={3} maxLength={2000} value={notes[r.id] ?? r.note ?? ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
              </label>
              <div className="ad-range">
                <button type="button" className="ad-btn ad-primary" onClick={() => void patch(r.id, { note: (notes[r.id] ?? r.note ?? "").trim() || null })}>
                  حفظ الملاحظة
                </button>
                <button type="button" className="ad-btn ad-danger" onClick={() => void remove(r.id)}>حذف</button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
