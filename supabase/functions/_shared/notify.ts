// بيبعت ملخص الطلب على تليجرام وإيميل. لو واحد فشل التاني بيكمّل.
// أي فشل بيتسجل في Logs الدالة (Supabase → Edge Functions → Logs) من غير ما يكتب التوكن أو المفتاح.
const TIMEOUT_MS = 8000;
const TELEGRAM_LIMIT = 4000; // تليجرام بيرفض الرسالة الأطول من 4096 حرف

export async function notify(text: string): Promise<void> {
  await Promise.allSettled([sendTelegram(text), sendEmail(text)]);
}

// رابط تليجرام فيه التوكن، فمش بنطبع الرابط ولا رسالة الخطأ (ممكن تحتويه)، بس الحالة وسبب الرفض
async function post(label: string, url: string, init: { headers: Record<string, string>; body: string }): Promise<void> {
  try {
    const res = await fetch(url, { method: "POST", ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) console.error(`${label} فشل: ${res.status} ${(await res.text()).slice(0, 200)}`);
  } catch (e) {
    console.error(`${label} فشل: ${e instanceof Error ? e.name : "خطأ في الاتصال"}`);
  }
}

async function sendTelegram(text: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) {
    console.warn("تليجرام: TELEGRAM_BOT_TOKEN أو TELEGRAM_CHAT_ID مش متحطين في أسرار Supabase");
    return;
  }
  await post("تليجرام", `https://api.telegram.org/bot${token}/sendMessage`, {
    headers: { "Content-Type": "application/json" },
    // نص عادي من غير parse_mode، ومن غير معاينة روابط (الزائر هو اللي كاتب النص)
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, TELEGRAM_LIMIT),
      link_preview_options: { is_disabled: true },
    }),
  });
}

async function sendEmail(text: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_EMAIL_TO");
  const from = Deno.env.get("NOTIFY_EMAIL_FROM");
  if (!key || !to || !from) {
    console.warn("إيميل: RESEND_API_KEY أو NOTIFY_EMAIL_TO أو NOTIFY_EMAIL_FROM مش متحطين في أسرار Supabase");
    return;
  }
  await post("إيميل", "https://api.resend.com/emails", {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to, subject: "طلب جديد من موقع AL MO", text }),
  });
}
