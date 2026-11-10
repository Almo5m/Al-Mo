import { useEffect } from "react";
import { track } from "./track";

// زيارة + الأقسام اللي الزائر وصلها. القسم بيتعد لما يعدّي على منتصف الشاشة (شريط ضيق في النص)،
// فينفع مع أي طول، حتى الأقسام الطويلة المثبّتة في السكرول (نسبة ظهور 40% كانت مستحيلة عليها).
export function useAnalytics(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    track("view");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target.id && e.target.id !== "top") track("section", e.target.id);
          io.unobserve(e.target);
        }),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    document.querySelectorAll("main section[id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}
