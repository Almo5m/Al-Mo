import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { sb } from "./supabase";
import { actionLabel, BarChart, countryLabel, DEVICE, LANG, refLabel, Rows, SECTION, type KC } from "./ui";

type Stats = {
  days: number;
  total_views: number;
  daily: { day: string; visitors: number }[];
  refs: KC[];
  devices: KC[];
  browsers: KC[];
  langs: KC[];
  countries: KC[];
  sections: KC[];
  actions: KC[];
  funnel: { view: number; projects: number; demo: number; chat: number; request: number };
  new_requests: number;
  pending_reviews: number;
};

const RANGES = [7, 30, 90];

export default function Overview() {
  const [days, setDays] = useState(30);
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (d: number) => {
    setErr("");
    const { data, error } = await sb.rpc("admin_overview", { p_days: d });
    if (error) {
      setErr("تعذّر تحميل الإحصائيات. تأكد إن ملف 0002_dashboard.sql اتشغّل.");
      return;
    }
    setS(data as Stats);
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  if (err) return <p className="ad-err" role="alert">{err}</p>;
  if (!s) return <p className="ad-muted">...</p>;

  const f = s.funnel;
  const steps: { label: string; n: number }[] = [
    { label: "زاروا الموقع", n: f.view },
    { label: "وصلوا لقسم المشاريع", n: f.projects },
    { label: "فتحوا ديمو", n: f.demo },
    { label: "بدأوا محادثة مع الرفيق", n: f.chat },
    { label: "بعتوا طلب (فورم أو الرفيق)", n: f.request },
  ];

  return (
    <div className="ad-stack">
      <div className="ad-range" role="group" aria-label="الفترة">
        {RANGES.map((d) => (
          <button key={d} type="button" className={`ad-btn ${d === days ? "ad-on" : ""}`} onClick={() => setDays(d)}>
            آخر {d} يوم
          </button>
        ))}
      </div>

      <div className="ad-grid ad-stats">
        <div className="ad-card">
          <span className="ad-muted">زيارات (زائر لكل يوم)</span>
          <strong className="ad-num">{s.total_views}</strong>
        </div>
        <div className="ad-card">
          <span className="ad-muted">طلبات جديدة</span>
          <strong className="ad-num">{s.new_requests}</strong>
        </div>
        <div className="ad-card">
          <span className="ad-muted">آراء بتستنى مراجعتك</span>
          <strong className="ad-num">{s.pending_reviews}</strong>
        </div>
      </div>

      <div className="ad-card">
        <h2>الزيارات اليومية</h2>
        <BarChart data={s.daily} />
      </div>

      <div className="ad-card">
        <h2>مسار الزائر</h2>
        <ul className="ad-rows">
          {steps.map((x) => (
            <li key={x.label} style={{ "--w": `${f.view ? (x.n / f.view) * 100 : 0}%` } as CSSProperties}>
              <span>{x.label}</span>
              <b>
                {x.n}
                {f.view > 0 && x !== steps[0] ? ` (${Math.round((x.n / f.view) * 100)}%)` : ""}
              </b>
            </li>
          ))}
        </ul>
      </div>

      <div className="ad-grid">
        <div className="ad-card">
          <h2>المصادر</h2>
          <Rows items={s.refs} label={refLabel} />
        </div>
        <div className="ad-card">
          <h2>الأقسام اللي اتشافت</h2>
          <Rows items={s.sections} label={(k) => SECTION[k] ?? k} />
        </div>
        <div className="ad-card">
          <h2>التفاعلات</h2>
          <Rows items={s.actions} label={actionLabel} />
        </div>
        <div className="ad-card">
          <h2>الأجهزة</h2>
          <Rows items={s.devices} label={(k) => DEVICE[k] ?? k} />
        </div>
        <div className="ad-card">
          <h2>المتصفحات</h2>
          <Rows items={s.browsers} label={(k) => (k === "unknown" ? "غير معروف" : k)} />
        </div>
        <div className="ad-card">
          <h2>اللغات</h2>
          <Rows items={s.langs} label={(k) => LANG[k] ?? k} />
        </div>
        <div className="ad-card">
          <h2>الدول</h2>
          <Rows items={s.countries} label={countryLabel} />
        </div>
      </div>

      <p className="ad-muted">
        كل زائر بيتحسب مرة في اليوم، والهوية بتتغيّر كل يوم (مفيش كوكيز ومفيش IP متخزّن)، فمفيش تتبع للزائر عبر الأيام. الدولة بتظهر لو المنصة بعتتها، والتواريخ بتوقيت UTC.
      </p>
    </div>
  );
}
