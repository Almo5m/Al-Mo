import { useLang } from "./LangContext";
import { HEADER } from "./header";
import { useReviews } from "../lib/reviews";
import { useContent } from "../lib/content";

// روابط القائمة بتتبع اللي ظاهر فعلًا في الموقع: الآراء (لو فيه آراء مقبولة)، المشاريع (لو فيه مشروع ظاهر)،
// والرفيق وطريقة الشغل (لو الأدمن مش مقفّلهم من اللوحة).
export function useNavLinks(): { id: string; label: string }[] {
  const lang = useLang();
  const hasReviews = useReviews().length > 0;
  const { projects, sections } = useContent();
  return HEADER[lang].links.filter(
    (l) =>
      (l.id !== "testimonials" || hasReviews) &&
      (l.id !== "projects" || projects.length > 0) &&
      (l.id !== "companion" || sections.companion) &&
      (l.id !== "process" || sections.process)
  );
}
