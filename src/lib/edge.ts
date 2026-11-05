// نداء دوال Supabase (companion و contact) في مكان واحد، مع تشخيص واضح في الـ console لصاحب الموقع.
// المفتاح هنا هو anon (آمن يظهر في المتصفح)، ومفاتيح الـ AI والإشعارات على السيرفر بس.
export type EdgeKind = "offline" | "limit" | "invalid" | "error";

export class EdgeError extends Error {
  constructor(public kind: EdgeKind) {
    super(kind);
  }
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// الزائر بيشوف رسالة هادية، وصاحب الموقع بيلاقي السبب الحقيقي هنا (افتح Console في المتصفح)
const warn = (fn: string, why: string) => console.warn(`[AL MO] ${fn}: ${why}`);

export async function callEdge(fn: string, body: unknown): Promise<Response> {
  if (!URL || !KEY) {
    warn(fn, "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY مش موجودين في النسخة دي. متغيرات VITE_ بتتدمج وقت البناء: ضيفهم في Vercel (Settings → Environment Variables) وبعدين اعمل Redeploy.");
    throw new EdgeError("offline");
  }

  let res: Response;
  try {
    res = await fetch(`${URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
      body: JSON.stringify(body),
    });
  } catch {
    warn(fn, `الطلب اتحجب أو فشل قبل ما يوصل (CORS أو النت أو الدالة مش منشورة). تأكد إن ALLOWED_ORIGIN في Supabase = ${location.origin} بالظبط، وإن الدالة منشورة.`);
    throw new EdgeError("offline");
  }
  if (res.ok) return res;

  if (res.status === 429) throw new EdgeError("limit");
  if (res.status === 400) throw new EdgeError("invalid");
  if (res.status === 403) warn(fn, `403: الدومين ${location.origin} مش مطابق لـ ALLOWED_ORIGIN في أسرار Supabase.`);
  else if (res.status === 401) warn(fn, "401: Supabase رفض المفتاح (JWT). لو المفتاح من نوع sb_publishable انشر الدالة بـ --no-verify-jwt.");
  else if (res.status === 404) warn(fn, "404: الدالة مش منشورة على مشروع Supabase ده.");
  else warn(fn, `${res.status}: خطأ في السيرفر. شوف Logs الدالة في Supabase (غالبًا AI_API_KEY أو AI_MODEL).`);
  throw new EdgeError([401, 403, 404].includes(res.status) ? "offline" : "error");
}
