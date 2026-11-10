import { useCallback, useEffect, useState } from "react";
import { configured, sb } from "./supabase";
import { Login, MfaEnroll, MfaVerify } from "./Auth";
import Overview from "./Overview";
import Requests from "./Requests";
import Reviews from "./Reviews";
import Projects from "./Projects";
import SiteSettings from "./SiteSettings";
import Settings from "./Settings";
import "./admin.css";

type Phase = "loading" | "unconfigured" | "login" | "verify" | "enroll" | "denied" | "ready";
type Tab = "overview" | "requests" | "reviews" | "projects" | "site" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "نظرة عامة" },
  { id: "requests", label: "الطلبات" },
  { id: "reviews", label: "الآراء" },
  { id: "projects", label: "المشاريع" },
  { id: "site", label: "الموقع" },
  { id: "settings", label: "الإعدادات" },
];

// لوحة التحكم (/admin). الدخول: إيميل + كلمة سر + كود تحقق. بعد كده كل البيانات محمية بصلاحيات قاعدة البيانات
// (is_admin + aal2)، فحتى لو حد فتح الصفحة مش هيشوف أي حاجة من غير ما يبقى أدمن.
export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tab, setTab] = useState<Tab>("overview");
  const [badges, setBadges] = useState({ requests: 0, reviews: 0 });

  useEffect(() => {
    document.title = "لوحة التحكم";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  const resolve = useCallback(async () => {
    if (!configured) {
      setPhase("unconfigured");
      return;
    }
    const { data: s } = await sb.auth.getSession();
    if (!s.session) {
      setPhase("login");
      return;
    }
    const { data: a } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (a?.currentLevel === "aal2") {
      const { data: ok } = await sb.rpc("is_admin");
      setPhase(ok === true ? "ready" : "denied");
    } else if (a?.nextLevel === "aal2") {
      setPhase("verify");
    } else {
      setPhase("enroll");
    }
  }, []);

  useEffect(() => {
    void resolve();
    const { data } = sb.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") setPhase("login");
    });
    return () => data.subscription.unsubscribe();
  }, [resolve]);

  const refreshBadges = useCallback(async () => {
    const a = await sb.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new");
    const b = await sb.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending");
    setBadges({ requests: a.count ?? 0, reviews: b.count ?? 0 });
  }, []);

  useEffect(() => {
    if (phase === "ready") void refreshBadges();
  }, [phase, refreshBadges]);

  if (phase === "loading") return <main className="ad"><p className="ad-muted">...</p></main>;

  if (phase === "unconfigured") {
    return (
      <main className="ad">
        <div className="ad-card ad-narrow">
          <h1>لوحة التحكم</h1>
          <p className="ad-err">متغيرات Supabase (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY) مش موجودة في النسخة دي.</p>
        </div>
      </main>
    );
  }

  if (phase === "login") return <main className="ad"><Login onDone={() => void resolve()} /></main>;
  if (phase === "verify") return <main className="ad"><MfaVerify onDone={() => void resolve()} /></main>;
  if (phase === "enroll") return <main className="ad"><MfaEnroll onDone={() => void resolve()} /></main>;

  if (phase === "denied") {
    return (
      <main className="ad">
        <div className="ad-card ad-narrow">
          <h1>مفيش صلاحية</h1>
          <p className="ad-muted">الحساب ده مش مسجّل كأدمن. اطلب من مسؤول المشروع يضيفه.</p>
          <button type="button" className="ad-btn" onClick={() => void sb.auth.signOut()}>خروج</button>
        </div>
      </main>
    );
  }

  return (
    <main className="ad">
      <header className="ad-bar">
        <strong>AL MO · لوحة التحكم</strong>
        <nav aria-label="أقسام اللوحة">
          {TABS.map((t) => {
            const n = t.id === "requests" ? badges.requests : t.id === "reviews" ? badges.reviews : 0;
            return (
              <button key={t.id} type="button" className={`ad-tab ${tab === t.id ? "ad-on" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
                {n > 0 && <span className="ad-badge">{n}</span>}
              </button>
            );
          })}
        </nav>
      </header>
      <div className="ad-body">
        {tab === "overview" && <Overview />}
        {tab === "requests" && <Requests onChange={() => void refreshBadges()} />}
        {tab === "reviews" && <Reviews onChange={() => void refreshBadges()} />}
        {tab === "projects" && <Projects />}
        {tab === "site" && <SiteSettings />}
        {tab === "settings" && <Settings />}
      </div>
    </main>
  );
}
