import { useEffect, useState, type FormEvent } from "react";
import { sb } from "./supabase";

// ثلاث شاشات: تسجيل الدخول، كود التحقق، وتفعيل كود التحقق لأول مرة (QR).
// رسائل الخطأ عامة عمدًا: مش بنقول إيه اللي غلط بالظبط (الإيميل ولا كلمة السر).

export function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setErr("بيانات الدخول غلط.");
    else onDone();
  }

  return (
    <form className="ad-card ad-narrow" onSubmit={submit}>
      <h1>لوحة التحكم</h1>
      <label>
        <span>الإيميل</span>
        <input type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        <span>كلمة السر</span>
        <input type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {err && <p className="ad-err" role="alert">{err}</p>}
      <button type="submit" className="ad-btn ad-primary" disabled={busy}>{busy ? "..." : "دخول"}</button>
    </form>
  );
}

export function MfaVerify({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    const { data: list } = await sb.auth.mfa.listFactors();
    const factor = list?.totp?.[0];
    if (!factor) {
      setBusy(false);
      setErr("مفيش كود تحقق مفعّل على الحساب ده.");
      return;
    }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    setBusy(false);
    if (error) setErr("الكود غلط أو انتهى. جرّب الكود الحالي.");
    else onDone();
  }

  return (
    <form className="ad-card ad-narrow" onSubmit={submit}>
      <h1>كود التحقق</h1>
      <p className="ad-muted">افتح تطبيق المصادقة (Google Authenticator أو غيره) واكتب الكود المكوّن من 6 أرقام.</p>
      <input
        className="ad-code"
        dir="ltr"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        aria-label="كود التحقق"
        autoFocus
      />
      {err && <p className="ad-err" role="alert">{err}</p>}
      <button type="submit" className="ad-btn ad-primary" disabled={busy || code.length !== 6}>{busy ? "..." : "تأكيد"}</button>
      <button type="button" className="ad-btn" onClick={() => void sb.auth.signOut()}>خروج</button>
    </form>
  );
}

type Enroll = { id: string; qr: string; secret: string };

export function MfaEnroll({ onDone }: { onDone: () => void }) {
  const [factor, setFactor] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let off = false;
    (async () => {
      // لو فيه محاولة تفعيل قديمة ما اتكملتش نمسحها
      const { data: list } = await sb.auth.mfa.listFactors();
      for (const x of list?.all ?? []) {
        if (x.status === "unverified") await sb.auth.mfa.unenroll({ factorId: x.id });
      }
      const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `AL MO admin ${Date.now()}` });
      if (off) return;
      if (error || !data) {
        setErr("تعذّر بدء التفعيل. تأكد إن MFA متفعّل في إعدادات Supabase Auth.");
        return;
      }
      setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
    return () => {
      off = true;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !factor) return;
    setBusy(true);
    setErr("");
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    setBusy(false);
    if (error) setErr("الكود غلط. تأكد إنك ضفت الحساب في التطبيق واكتب الكود الحالي.");
    else onDone();
  }

  return (
    <form className="ad-card ad-narrow" onSubmit={submit}>
      <h1>تفعيل كود التحقق</h1>
      <p className="ad-muted">أول مرة بس: امسح الصورة بتطبيق المصادقة (Google Authenticator أو Authy أو غيره)، وبعدها اكتب الكود اللي بيظهر.</p>
      {factor ? (
        <>
          <img className="ad-qr" src={factor.qr} alt="رمز QR لتفعيل كود التحقق" width={192} height={192} />
          <p className="ad-muted">
            لو مش قادر تمسح الصورة، اكتب المفتاح ده في التطبيق: <code dir="ltr">{factor.secret}</code>
          </p>
          <input
            className="ad-code"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            aria-label="كود التحقق"
          />
          <button type="submit" className="ad-btn ad-primary" disabled={busy || code.length !== 6}>{busy ? "..." : "تفعيل ودخول"}</button>
        </>
      ) : (
        !err && <p className="ad-muted">...</p>
      )}
      {err && <p className="ad-err" role="alert">{err}</p>}
      <button type="button" className="ad-btn" onClick={() => void sb.auth.signOut()}>خروج</button>
    </form>
  );
}
