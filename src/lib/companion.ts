// الاتصال بدالة الرفيق في Supabase. المفتاح هنا هو anon (آمن يظهر في المتصفح)، ومفتاح الـ AI على السيرفر بس.
export type Msg = { role: "user" | "assistant"; content: string };

export class CompanionError extends Error {
  constructor(public kind: "offline" | "limit" | "invalid" | "error", message?: string) {
    super(message ?? kind);
  }
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// آخر 19 رسالة، ولازم أول رسالة تكون من الزائر
function recentMessages(messages: Msg[]): Msg[] {
  let recent = messages.slice(-19);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  return recent;
}

export async function askCompanion(messages: Msg[]): Promise<string> {
  if (!URL || !KEY) throw new CompanionError("offline");

  const recent = recentMessages(messages);

  let res: Response;
  try {
    res = await fetch(`${URL}/functions/v1/companion`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
      body: JSON.stringify({ messages: recent }),
    });
  } catch {
    throw new CompanionError("offline");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new CompanionError(res.status === 429 ? "limit" : "error", data?.error);
  return String(data.reply ?? "");
}

// إرسال ملخص الحوار لمعاذ (بموافقة صريحة من الزائر)
export async function sendHandoff(messages: Msg[], contact: { name: string; email: string }): Promise<void> {
  if (!URL || !KEY) throw new CompanionError("offline");
  let res: Response;
  try {
    res = await fetch(`${URL}/functions/v1/companion`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
      body: JSON.stringify({ action: "handoff", consent: true, contact, messages: recentMessages(messages) }),
    });
  } catch {
    throw new CompanionError("offline");
  }
  if (res.ok) return;
  throw new CompanionError(res.status === 429 ? "limit" : res.status === 400 ? "invalid" : "error");
}
