import { PERSONA, SUMMARY_PROMPT } from "./persona.ts";
import { askModel, type Msg } from "./providers.ts";
import { notify } from "../_shared/notify.ts";
import { allowed, clientId, db, guard, json } from "../_shared/http.ts";

function validMessages(x: unknown): x is Msg[] {
  return (
    Array.isArray(x) && x.length > 0 && x.length <= 20 &&
    x.every((m) => (m?.role === "user" || m?.role === "assistant") &&
      typeof m.content === "string" && m.content.length > 0 && m.content.length <= 1000)
  );
}

Deno.serve(async (req) => {
  const early = guard(req);
  if (early) return early;

  try {
    const body = await req.json();
    if (!validMessages(body?.messages)) return json({ error: "رسالة غير صالحة" }, 400);

    const id = await clientId(req);
    const isHandoff = body.action === "handoff";
    if (!(await allowed(isHandoff ? `${id}:handoff` : `${id}:chat`, isHandoff ? 3 : 20))) {
      return json({ error: "limit" }, 429);
    }

    if (!isHandoff) return json({ reply: await askModel(PERSONA, body.messages) });

    // إرسال الطلب لمعاذ: لازم موافقة صريحة وبيانات تواصل
    const { consent, contact } = body;
    const name = String(contact?.name ?? "").trim();
    const email = String(contact?.email ?? "").trim();
    if (consent !== true) return json({ error: "لازم موافقتك الأول" }, 400);
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ error: "بيانات التواصل غير صالحة" }, 400);
    }

    const summary = (await askModel(SUMMARY_PROMPT, [
      ...body.messages,
      { role: "user", content: "لخّص الحوار ده لمعاذ." },
    ])).slice(0, 4000);

    const { error } = await db.from("contact_requests").insert({ name, email, summary });
    if (error) throw error;
    await notify(`طلب جديد من الرفيق\nالاسم: ${name}\nالإيميل: ${email}\n\n${summary}`);
    return json({ ok: true });
  } catch (e) {
    console.error(e); // التفاصيل في اللوج بس، مش بترجع للزائر
    return json({ error: "error" }, 500);
  }
});
