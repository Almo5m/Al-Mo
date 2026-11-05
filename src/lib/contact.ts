// إرسال فورم التواصل لدالة Supabase (contact).
import { callEdge, EdgeError } from "./edge";

export type ContactForm = { name: string; email: string; message: string; hp: string };
export { EdgeError as ContactError };

export async function sendContact(form: ContactForm): Promise<void> {
  await callEdge("contact", form);
}
