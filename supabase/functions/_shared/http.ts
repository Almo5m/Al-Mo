// أدوات مشتركة بين دوال Supabase: CORS والتحقق من المصدر وحدود الاستخدام.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ALLOWED_ORIGIN: دومين واحد أو كذا دومين بينهم فاصلة، من غير / في الآخر.
// مثال: https://al-mo.vercel.app,http://localhost:5173
const ALLOWED = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const SALT = Deno.env.get("IP_HASH_SALT") ?? "";
export const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cors = {
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// بيرجّع Response لو الطلب مرفوض (أو OPTIONS)، وإلا null يعني كمّل
export function guard(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!ALLOWED.includes(req.headers.get("origin") ?? "")) return json({ error: "origin" }, 403);
  return null;
}

// بديل Deno.serve: بيرجّع للمتصفح نفس الدومين اللي طلب (لو هو من المسموح بيهم) في Access-Control-Allow-Origin
export function serve(handler: (req: Request) => Promise<Response> | Response): void {
  Deno.serve(async (req) => {
    const res = await handler(req);
    const origin = req.headers.get("origin") ?? "";
    if (ALLOWED.includes(origin)) res.headers.set("Access-Control-Allow-Origin", origin);
    return res;
  });
}

// هاش من الـ IP، مش بنخزّن الـ IP نفسه
export async function clientId(req: Request): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + SALT));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function allowed(key: string, max: number, windowSeconds = 3600): Promise<boolean> {
  const { data } = await db.rpc("hit_rate_limit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  return Boolean(data);
}
