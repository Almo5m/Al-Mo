import { notify } from "../_shared/notify.ts";
import { allowed, clientId, db, guard, json } from "../_shared/http.ts";

// فورم التواصل: تحقق، حد 3 رسائل في الساعة، وفخ للبوتات (hp)
Deno.serve(async (req) => {
  const early = guard(req);
  if (early) return early;

  try {
    const b = await req.json();
    if (b?.hp) return json({ ok: true }); // حقل مخفي: اللي بيملاه بوت، بنتظاهر بالنجاح

    const name = String(b?.name ?? "").trim();
    const email = String(b?.email ?? "").trim();
    const message = String(b?.message ?? "").trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    if (!name || name.length > 80 || !validEmail || !message || message.length > 2000) {
      return json({ error: "invalid" }, 400);
    }

    if (!(await allowed(`${await clientId(req)}:form`, 3))) return json({ error: "limit" }, 429);

    const { error } = await db.from("contact_requests").insert({ name, email, summary: message, source: "form" });
    if (error) throw error;
    await notify(`رسالة من الفورم\nالاسم: ${name}\nالإيميل: ${email}\n\n${message}`);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "error" }, 500);
  }
});
