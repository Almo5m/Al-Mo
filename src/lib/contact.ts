// إرسال فورم التواصل لدالة Supabase (contact).
export type ContactForm = { name: string; email: string; message: string; hp: string };
export class ContactError extends Error {
  constructor(public kind: "offline" | "limit" | "invalid" | "error") {
    super(kind);
  }
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function sendContact(form: ContactForm): Promise<void> {
  if (!URL || !KEY) throw new ContactError("offline");
  let res: Response;
  try {
    res = await fetch(`${URL}/functions/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
      body: JSON.stringify(form),
    });
  } catch {
    throw new ContactError("offline");
  }
  if (res.ok) return;
  throw new ContactError(res.status === 429 ? "limit" : res.status === 400 ? "invalid" : "error");
}
