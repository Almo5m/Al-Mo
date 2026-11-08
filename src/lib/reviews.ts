import { useSyncExternalStore } from "react";

// آراء العملاء المقبولة من لوحة التحكم (دالة get_public_reviews). لو مفيش آراء أو حصل خطأ، القسم ورابطه بيتخفوا.
export type PublicReview = {
  id: string;
  author_name: string;
  author_role: string | null;
  body: string;
  rating: number | null;
  lang: string | null;
};

let reviews: PublicReview[] = [];
const listeners = new Set<() => void>();

export async function loadReviews(): Promise<void> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_public_reviews`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return;
    reviews = data.filter(
      (r): r is PublicReview => typeof r?.id === "string" && typeof r?.author_name === "string" && typeof r?.body === "string"
    );
    listeners.forEach((l) => l());
  } catch {
    /* من غير آراء: القسم بيفضل مخفي */
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useReviews = (): PublicReview[] => useSyncExternalStore(subscribe, () => reviews);
