import { createClient } from "@supabase/supabase-js";

// مفتاح anon (آمن يظهر في المتصفح). الحماية الحقيقية: صلاحيات الجداول (RLS) بتشترط إنك أدمن وداخل بكود التحقق.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const configured = Boolean(url && key);

export const sb = createClient(url ?? "https://missing.invalid", key ?? "missing", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
