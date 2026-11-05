// الاتصال بدالة الرفيق في Supabase.
import { callEdge, EdgeError } from "./edge";

export type Msg = { role: "user" | "assistant"; content: string };
export { EdgeError as CompanionError };

// آخر 19 رسالة، ولازم أول رسالة تكون من الزائر
function recentMessages(messages: Msg[]): Msg[] {
  let recent = messages.slice(-19);
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  return recent;
}

export async function askCompanion(messages: Msg[]): Promise<string> {
  const res = await callEdge("companion", { messages: recentMessages(messages) });
  const data = await res.json().catch(() => ({}));
  return String(data.reply ?? "");
}

// إرسال ملخص الحوار للفريق (بموافقة صريحة من الزائر)
export async function sendHandoff(messages: Msg[], contact: { name: string; email: string }): Promise<void> {
  await callEdge("companion", { action: "handoff", consent: true, contact, messages: recentMessages(messages) });
}
