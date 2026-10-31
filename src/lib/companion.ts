// الاتصال بدالة الرفيق في Supabase. المفتاح هنا هو anon (آمن يظهر في المتصفح)، ومفتاح الـ AI على السيرفر بس.
export type Msg = { role: "user" | "assistant"; content: string };

export class CompanionError extends Error {
  constructor(public kind: "offline" | "limit" | "error", message?: string) {
    super(message ?? kind);
  }
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function askCompanion(messages: Msg[]): Promise<string> {
  if (!URL || !KEY) throw new CompanionError("offline");

  // آخر 19 رسالة، ولازم أول رسالة تكون من الزائر
  let recent = messages.slice(-19);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);

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
