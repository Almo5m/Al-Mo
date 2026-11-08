import { notify } from "../_shared/notify.ts";
import { allowed, clientId, db, guard, json, serve } from "../_shared/http.ts";

// صفحة تقييم العميل: check بيتأكد إن اللينك شغال، submit بيسجّل الرأي (مرة واحدة بس لكل لينك).
// الرد دايمًا "invalid" لأي سبب (لينك غلط، منتهي، أو اتستخدم)، عشان محدش يعرف سبب الرفض.
const TOKEN = /^[A-Za-z0-9_-]{32,64}$/;

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  const early = guard(req);
  if (early) return early;

  try {
    const b = await req.json();
    if (b?.hp) return json({ ok: true }); // فخ البوتات

    const token = String(b?.token ?? "");
    if (!TOKEN.test(token)) return json({ error: "invalid" }, 400);
    if (!(await allowed(`${await clientId(req)}:review`, 30))) return json({ error: "limit" }, 429);

    const hash = await sha256Hex(token);
    const now = new Date().toISOString();

    if (b?.action === "check") {
      const { data, error } = await db
        .from("reviews")
        .select("project")
        .eq("token_hash", hash)
        .eq("status", "invited")
        .gt("expires_at", now)
        .maybeSingle();
      if (error) throw error;
      return data ? json({ ok: true, project: data.project ?? null }) : json({ error: "invalid" }, 400);
    }

    if (b?.action === "submit") {
      const name = String(b?.name ?? "").trim();
      const role = String(b?.role ?? "").trim();
      const text = String(b?.text ?? "").trim();
      const rating = Number(b?.rating);
      const lang = b?.lang === "en" ? "en" : "ar";
      if (
        !name || name.length > 80 || role.length > 120 ||
        text.length < 20 || text.length > 1000 ||
        !Number.isInteger(rating) || rating < 1 || rating > 5 ||
        b?.consent !== true
      ) {
        return json({ error: "invalid" }, 400);
      }

      // التحديث الشرطي بيضمن إن اللينك ينفع مرة واحدة حتى لو اتبعت طلبين في نفس اللحظة
      const { data, error } = await db
        .from("reviews")
        .update({
          status: "pending",
          author_name: name,
          author_role: role || null,
          body: text,
          rating,
          lang,
          consent_public: true,
          submitted_at: now,
        })
        .eq("token_hash", hash)
        .eq("status", "invited")
        .gt("expires_at", now)
        .select("id");
      if (error) throw error;
      if (!data?.length) return json({ error: "invalid" }, 400);

      await notify(`رأي جديد من ${name} (${rating}/5) بيستنى مراجعتك في لوحة التحكم.`);
      return json({ ok: true });
    }

    return json({ error: "invalid" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "error" }, 500);
  }
});
