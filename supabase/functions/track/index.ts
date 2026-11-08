import { allowed, clientId, db, guard, json, serve } from "../_shared/http.ts";
import { browserOf, countryOf, deviceOf, visitorId } from "../_shared/visitor.ts";

// تسجيل زيارة أو حدث من الموقع. من غير كوكيز ومن غير أي بيانات شخصية (شوف docs/admin-dashboard.md).
const TYPES = new Set(["view", "section", "demo", "channel", "chat", "handoff", "form", "lang"]);
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit/i;
const NAME = /^[a-z0-9_.:-]{0,40}$/;
const REF = /^(utm:[a-z0-9_.-]{1,40}|[a-z0-9.-]{1,80})$/;

serve(async (req) => {
  const early = guard(req);
  if (early) return early;

  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT.test(ua)) return new Response(null, { status: 204 }); // البوتات مش بتتعد

    const b = await req.json();
    const type = String(b?.type ?? "");
    const name = String(b?.name ?? "");
    if (!TYPES.has(type) || !NAME.test(name)) return json({ error: "invalid" }, 400);

    // لو حد زوّد الطلبات بنتجاهل بصمت (ما يستاهلش خطأ يظهر للمتصفح)
    if (!(await allowed(`${await clientId(req)}:track`, 120))) return new Response(null, { status: 204 });

    const lang = b?.lang === "ar" || b?.lang === "en" ? b.lang : null;
    let ref: string | null = null;
    let device: string | null = null;
    let browser: string | null = null;
    let country: string | null = null;
    if (type === "view") {
      const r = String(b?.ref ?? "").toLowerCase();
      ref = REF.test(r) ? r : null;
      device = deviceOf(ua);
      browser = browserOf(ua);
      country = countryOf(req);
    }

    const { error } = await db.rpc("track_event", {
      p_visitor: await visitorId(req),
      p_type: type,
      p_name: name,
      p_ref: ref,
      p_device: device,
      p_browser: browser,
      p_lang: lang,
      p_country: country,
    });
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return json({ error: "error" }, 500);
  }
});
