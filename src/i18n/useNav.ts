import { useLang } from "./LangContext";
import { HEADER } from "./header";
import { useReviews } from "../lib/reviews";

// روابط القائمة: رابط الآراء بيظهر بس لما يكون فيه آراء مقبولة
export function useNavLinks(): { id: string; label: string }[] {
  const lang = useLang();
  const hasReviews = useReviews().length > 0;
  return HEADER[lang].links.filter((l) => l.id !== "testimonials" || hasReviews);
}
