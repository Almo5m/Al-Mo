import { useEffect, useState } from "react";
import { sb } from "./supabase";
import { NO_TRACK_KEY } from "../lib/track";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [excluded, setExcluded] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    sb.auth.getUser().then(({ data }: { data: { user: { email?: string } | null } }) => setEmail(data.user?.email ?? ""));
    try {
      setExcluded(localStorage.getItem(NO_TRACK_KEY) === "1");
    } catch {
      /* التخزين مش متاح */
    }
  }, []);

  function toggleExclude() {
    const next = !excluded;
    try {
      if (next) localStorage.setItem(NO_TRACK_KEY, "1");
      else localStorage.removeItem(NO_TRACK_KEY);
      setExcluded(next);
    } catch {
      setMsg("المتصفح منع الحفظ.");
    }
  }

  async function purge() {
    if (!window.confirm("حذف الزيارات الأقدم من 400 يوم؟")) return;
    const { data, error } = await sb.rpc("purge_old_events", { p_days: 400 });
    setMsg(error ? "تعذّر الحذف." : `اتحذف ${String(data)} سجل.`);
  }

  return (
    <div className="ad-stack">
      <div className="ad-card ad-stack">
        <h2>الحساب</h2>
        <p dir="ltr" className="ad-muted">{email}</p>
        <button type="button" className="ad-btn" onClick={() => void sb.auth.signOut()}>تسجيل الخروج</button>
      </div>

      <div className="ad-card ad-stack">
        <h2>استبعاد متصفحي من الإحصائيات</h2>
        <p className="ad-muted">
          لو فعّلته، زياراتك من المتصفح ده (على الجهاز ده) ما بتتعدش. بتحتاج تفعّله مرة على كل جهاز.
        </p>
        <button type="button" className={`ad-btn ${excluded ? "ad-on" : ""}`} onClick={toggleExclude}>
          {excluded ? "مفعّل: المتصفح ده مستبعد" : "تفعيل الاستبعاد"}
        </button>
      </div>

      <div className="ad-card ad-stack">
        <h2>تنظيف البيانات</h2>
        <p className="ad-muted">بيحذف سجلات الزيارات الأقدم من 400 يوم. الطلبات والآراء ما بتتأثرش.</p>
        <button type="button" className="ad-btn ad-danger" onClick={() => void purge()}>حذف الزيارات القديمة</button>
        {msg && <p className="ad-muted" role="status">{msg}</p>}
      </div>
    </div>
  );
}
