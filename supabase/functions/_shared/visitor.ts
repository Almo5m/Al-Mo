// تعريف الزائر بدون كوكيز وبدون تخزين الـ IP: هاش من (سر + تاريخ اليوم + IP + المتصفح).
// الهاش بيتغيّر كل يوم، فمفيش تتبع للزائر عبر الأيام، والـ IP نفسه مبيتخزّنش في أي مكان.
const SALT = Deno.env.get("IP_HASH_SALT") ?? "";

export async function visitorId(req: Request): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${SALT}:${day}:${ip}:${ua}`));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

// الترتيب مهم: Edge وOpera وSamsung بيحطوا كلمة Chrome في الـ UA كمان
export function browserOf(ua: string): string {
  if (/edg(e|a|ios)?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

// الدولة من ترويسة Cloudflare/المنصة لو موجودة (مش مضمونة)، وإلا null
export function countryOf(req: Request): string | null {
  const c = (req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== "XX" && c !== "T1" ? c : null;
}
